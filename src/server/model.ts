import { createCipheriv, createDecipheriv, randomBytes , createHash} from 'crypto';
import { AzureStorageLogger, AzureStorageRepository, Metadata } from './repository';
import { ulid } from 'ulid';

const SECRET = Buffer.from(process.env.ILEFTIT_SECRET, 'hex');

const repo = new AzureStorageRepository();
const logger = new AzureStorageLogger();

class Will {
    private meta: Metadata;
    private uid: string;
    public bid: string;
    public get title() : string {
        return this.meta.title;
    }
    public get openAt(): Date {
        return this.meta.openAt;
    }
    public get status() {
        return this.openAt > new Date() ? 'close' : 'open';
    }
    constructor(uid:string, bid:string, meta: Metadata) {
        this.uid = uid;
        this.bid = bid;
        this.meta = meta;
    }

    public async body() {
        const blob = await repo.blob(this.meta.blobPath);
        if (blob === null) {
            return null;
        }
        return decrypt(SECRET, blob);
    }

    public authorize(password: string) {
        return calcHash(this.meta.passwordSalt + password) === this.meta.passwordHash;
    }

    public async replace(title: string, body: Buffer) {
        const blob = encrypt(SECRET, body);
        this.meta.title = title;
        await repo.replace(this.uid, this.bid, this.meta, blob);
    }

    async extend(hours: number) {
        if (hours < 0) {
            throw new Error('not supported');
        }
        const ms = 1000 * 60 * 60 * hours;
        this.meta.openAt = new Date(this.meta.openAt.getTime() + ms);
        await repo.replace(this.uid, this.bid, this.meta);
    }

    async remove() {
        await repo.remove(this.uid, this.bid, this.meta);
    }
}

export function list(uid: string) {
    return repo.list(uid);
}

export async function retrieve(uid: string, bid: string) {
    const meta = await repo.get(uid, bid);
    
    if (!meta) {
        return null;
    }

    return new Will(uid, bid, meta);
}

export async function add(uid: string, title: string, body: Buffer, openAt: Date, password: string) {
    const salt = randomBytes(32).toString('hex');
    const bid = crypto.randomUUID().replaceAll('-','');
    const blobPath = `${uid}/${bid}.bin`;
    const blob = encrypt(SECRET, body);
    const meta = {
        title,
        openAt,
        blobPath,
        passwordSalt: salt,
        passwordHash: calcHash(salt + password),
    };
    await repo.add(uid, bid, meta, body);
    return new Will(uid, bid, meta);
}

export const log = logger.log.bind(logger);
export const history = logger.list.bind(logger);

function calcHash(plain: string) {
    return createHash('sha256').update(plain).digest('hex');
}

function encrypt(key: Buffer, data: Buffer) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('chacha20-poly1305', key, iv, {
        authTagLength: 16
    });
    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(key: Buffer, data: Buffer) {
    const decipher = createDecipheriv(
        'chacha20-poly1305',
        key,
        data.subarray(0, 12),
        {
            authTagLength: 16
        }
    );
    decipher.setAuthTag(
        data.subarray(12, 28)
    );
    const decrypted = [
        decipher.update(
            data.subarray(28)
        ), 
        decipher.final()
    ];
    return Buffer.concat(decrypted);
}
