(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CryptoService = void 0;
    function decodeAlg(alg) {
        switch (alg.name) {
            case 'PBKDF2': return {
                ...alg,
                salt: fromBase64(alg.salt)
            };
            case 'AES-GCM': return {
                name: alg.name,
                iv: fromBase64(alg.iv)
            };
        }
        throw new Error(`not supported`);
    }
    function derivedKeyType(alg) {
        switch (alg.name) {
            case 'AES-GCM': return {
                name: alg.name,
                length: alg.length,
            };
        }
        throw new Error(`not supported`);
    }
    class CryptoService {
        constructor(d, k, s, l) {
            this.data = d;
            this.cryptoKey = k;
            this.secret = s;
            this.loginPassword = l;
        }
        static async createImpl(data) {
            const keyMaterial = await window.crypto.subtle.importKey("raw", fromBase64(data.k), { name: data.d.name }, false, ["deriveBits", "deriveKey"]);
            const cryptoKey = await window.crypto.subtle.deriveKey(decodeAlg(data.d), keyMaterial, derivedKeyType(data.c), true, ["encrypt", "decrypt"]);
            const exported = await window.crypto.subtle.exportKey("raw", cryptoKey);
            const loginPassword = toBase64(new Uint8Array(await crypto.subtle.digest(data.d.hash, new Uint8Array(exported))));
            const secret = btoa(JSON.stringify(data));
            return new CryptoService(data, cryptoKey, secret, loginPassword);
        }
        static create(secret) {
            if (secret) {
                const data = JSON.parse(atob(secret));
                return this.createImpl(data);
            }
            else {
                const data = {
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
                };
                return this.createImpl(data);
            }
        }
        async encrypt(plainText) {
            const enc = new TextEncoder();
            const cipher = await window.crypto.subtle.encrypt(decodeAlg(this.data.c), this.cryptoKey, enc.encode(plainText));
            return toBase64(new Uint8Array(cipher));
        }
        async decrypt(cipherText) {
            const dec = new TextDecoder();
            const cipher = fromBase64(cipherText);
            const plain = await window.crypto.subtle.decrypt(decodeAlg(this.data.c), this.cryptoKey, cipher.buffer);
            return dec.decode(plain);
        }
        getSecret() {
            return this.secret;
        }
        getLoginPassword() {
            return this.loginPassword;
        }
    }
    exports.CryptoService = CryptoService;
    function toBase64(data) {
        return btoa([...data].map(n => String.fromCharCode(n)).join("")).replaceAll('=', '');
    }
    function fromBase64(data) {
        return new Uint8Array([...atob(data)].map(s => s.charCodeAt(0)));
    }
});
