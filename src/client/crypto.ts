type Base64String = string
type AESGCM = {
    name: 'AES-GCM'
    iv: Base64String
    length: number
}
type CryptoAlg = AESGCM
type PBKDF2<HashAlg extends string> = {
    name: 'PBKDF2',
    salt: Base64String, 
    iterations: number,
    hash: HashAlg
}
type DeriveAlg = PBKDF2<'SHA-256'> | PBKDF2<'SHA-512'>
type SecretData = {
    k: Base64String
    c: CryptoAlg
    d: DeriveAlg
}
function decodeAlg(alg: CryptoAlg|DeriveAlg) {
    switch (alg.name) {
        case 'PBKDF2': return {
            ...alg,
            salt: fromBase64(alg.salt)
        };
        case 'AES-GCM': return {
            name: alg.name,
            iv: fromBase64(alg.iv)
        }
    }
    throw new Error(`not supported`);
}
function derivedKeyType(alg: CryptoAlg) {
    switch (alg.name) {
        case 'AES-GCM': return {
            name: alg.name,
            length: alg.length,
        }
    }
    throw new Error(`not supported`);
}
export class CryptoService {
    private data: SecretData
    private cryptoKey: CryptoKey
    private secret: string
    private loginPassword: string
    private constructor(d, k, s, l) {
        this.data = d;
        this.cryptoKey = k;
        this.secret = s;
        this.loginPassword = l;
    }
    private static async createImpl(data: SecretData): Promise<CryptoService> {
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            fromBase64(data.k),
            { name: data.d.name },
            false,
            ["deriveBits", "deriveKey"]
        );
        const cryptoKey = await window.crypto.subtle.deriveKey(
            decodeAlg(data.d),
            keyMaterial,
            derivedKeyType(data.c),
            true,
            ["encrypt", "decrypt"]
        );
        const exported = await window.crypto.subtle.exportKey("raw", cryptoKey);
        const loginPassword = toBase64(new Uint8Array(await crypto.subtle.digest(data.d.hash, new Uint8Array(exported))));
        const secret = btoa(JSON.stringify(data));
        return new CryptoService(data, cryptoKey, secret, loginPassword);
    }
    static create(secret?: string): Promise<CryptoService> {
        if (secret) {
            const data: SecretData = JSON.parse(atob(secret));
            return this.createImpl(data);
        }
        else {
            const data: SecretData = {
                k: toBase64(window.crypto.getRandomValues(new Uint8Array(32))),
                c: {
                    name: 'AES-GCM',
                    length: 256,
                    iv: toBase64(window.crypto.getRandomValues(new Uint8Array(32)))
                },
                d: {
                    name: 'PBKDF2',
                    salt: toBase64(window.crypto.getRandomValues(new Uint8Array(64))),
                    iterations: 100000,
                    hash: 'SHA-512'
                }
            }
            return this.createImpl(data);
        }
    }
    public async encrypt(plainText: string) {
        const enc = new TextEncoder();
        const cipher = await window.crypto.subtle.encrypt(
            decodeAlg(this.data.c),
            this.cryptoKey,
            enc.encode(plainText)
        );
        return toBase64(new Uint8Array(cipher));
    }
    public async decrypt(cipherText: string) {
        const dec = new TextDecoder();
        const cipher = fromBase64(cipherText);
        const plain = await window.crypto.subtle.decrypt(
            decodeAlg(this.data.c),
            this.cryptoKey,
            cipher.buffer
        );
        return dec.decode(plain);
    }
    public getSecret() {
        return this.secret;
    }
    public getLoginPassword() {
        return this.loginPassword;
    }
}

function toBase64(data: Uint8Array) {
    return btoa([...data].map(n => String.fromCharCode(n)).join("")).replaceAll('=', '');
}

function fromBase64(data: string) {
    return new Uint8Array([...atob(data)].map(s => s.charCodeAt(0)));
}
