import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  randomUUID,
} from 'crypto';
import {
  AzureStorageLogger,
  AzureStorageRepository,
  AzureStorageSubscriptionStore,
  ILogger,
  ISubscriptionStore,
  Metadata,
} from './repository';

const SECRET = Buffer.from(process.env.ILEFTIT_SECRET, 'hex');

const repo = new AzureStorageRepository();
const logger = new AzureStorageLogger();
const subs = new AzureStorageSubscriptionStore();

class Will {
  private meta: Metadata;
  private uid: string;
  public bid: string;
  public get title(): string {
    return this.meta.title;
  }
  public get openAt(): Date {
    return this.meta.openAt;
  }
  public get status() {
    return this.openAt > new Date() ? 'close' : 'open';
  }
  constructor(uid: string, bid: string, meta: Metadata) {
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
    return (
      calcHash(this.meta.passwordSalt + password) === this.meta.passwordHash
    );
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

export async function add(
  uid: string,
  title: string,
  body: Buffer,
  openAt: Date,
  password: string
) {
  const salt = randomBytes(32).toString('hex');
  const bid = randomUUID().replaceAll('-', '');
  const blobPath = `${uid}/${bid}.bin`;
  const blob = encrypt(SECRET, body);
  const meta = {
    title,
    openAt,
    blobPath,
    passwordSalt: salt,
    passwordHash: calcHash(salt + password),
  };
  await repo.add(uid, bid, meta, blob);
  return new Will(uid, bid, meta);
}

export const log: ILogger['log'] = logger.log.bind(logger);
export const history: ILogger['list'] = logger.list.bind(logger);

function calcHash(plain: string) {
  return createHash('sha256').update(plain).digest('hex');
}

function encrypt(key: Buffer, data: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('chacha20-poly1305', key, iv, {
    authTagLength: 16,
  });
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(key: Buffer, data: Buffer) {
  const decipher = createDecipheriv(
    'chacha20-poly1305',
    key,
    data.subarray(0, 12),
    {
      authTagLength: 16,
    }
  );
  decipher.setAuthTag(data.subarray(12, 28));
  const decrypted = [decipher.update(data.subarray(28)), decipher.final()];
  return Buffer.concat(decrypted);
}

export const setSubscription: ISubscriptionStore['set'] = subs.set.bind(subs);
export const getSubscription: ISubscriptionStore['get'] = subs.get.bind(subs);
export const getSubscriptions: ISubscriptionStore['list'] =
  subs.list.bind(subs);
export const deleteSubscription: ISubscriptionStore['remove'] =
  subs.remove.bind(subs);
export async function* listSubscriptions(
  from: Date = new Date(),
  days: number = 7
): AsyncGenerator<[uid: string, json: string]> {
  const returned = {};
  const fromTime = from.getTime();
  const to = new Date(fromTime + days * DAY);
  for await (let { uid, openAt } of repo.filter(from, to)) {
    if (
      listSubscriptionsNecessaryToPushPredicator(fromTime, openAt.getTime())
    ) {
      if (!returned[uid]) {
        returned[uid] = true;
        const items = await subs.list(uid);
        for (let { json } of items) {
          yield [uid, json];
        }
      }
    }
  }
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
export function listSubscriptionsNecessaryToPushPredicator(
  now: number,
  openAt: number
) {
  const dt = Math.floor((openAt - now) / HOUR);
  if (dt <= 6) {
    return true;
  }
  const dt$2 = dt % 2;
  if (dt <= 12 && dt$2 == 0) {
    return true;
  }
  const dt$6 = dt % 6;
  if (dt <= 24 && dt$6 == 0) {
    return true;
  }
  const dt$24 = dt % 24;
  if (dt$24 == 0) {
    return true;
  }
  return false;
}

export async function deleteAll(uid: string) {
  await Promise.all([
    repo.deleteAll(uid),
    subs.deleteAll(uid)
  ]);
}