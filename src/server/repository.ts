import { TableClient, TableEntityResult, odata } from '@azure/data-tables';
import { BlobServiceClient } from '@azure/storage-blob';
import { createHash } from 'crypto';

export type Metadata = {
  title: string;
  openAt: Date;
  blobPath: string;
  passwordSalt: string;
  passwordHash: string;
};

export type Summary = {
  uid: string;
  bid: string;
  title: string;
  openAt: Date;
};

export interface IRepository {
  list(uid: string): Promise<Summary[]>;
  get(uid: string, bid: string): Promise<Metadata>;
  blob(uid: string, bid: string): Promise<Buffer>;
  add(uid: string, bid: string, meta: Metadata, blob: Buffer): Promise<void>;
  replace(
    uid: string,
    bid: string,
    meta: Metadata,
    blob: Buffer
  ): Promise<void>;
  remove(uid: string, bid: string, meta: Metadata): Promise<void>;
  filter(from: Date, to: Date);
}

export class AzureStorageRepository implements IRepository {
  private serviceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  private containerClient = this.serviceClient.getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );
  private tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  async list(uid: string): Promise<Summary[]> {
    const result: Summary[] = [];
    const entities = this.tableClient.listEntities<Metadata>({
      queryOptions: { filter: odata`PartitionKey eq ${uid}` },
    });

    for await (const { partitionKey, rowKey, title, openAt } of entities) {
      result.push({
        uid: partitionKey,
        bid: rowKey,
        title,
        openAt,
      });
    }
    return result;
  }

  async *filter(from: Date, to: Date): AsyncGenerator<Summary> {
    const entities = this.tableClient.listEntities<Metadata>({
      queryOptions: { filter: odata`openAt ge ${from} and openAt le ${to}` },
    });

    for await (const { partitionKey, rowKey, title, openAt } of entities) {
      yield {
        uid: partitionKey,
        bid: rowKey,
        title,
        openAt,
      };
    }
  }

  async get(uid: string, bid: string): Promise<Metadata> {
    const entity = await this.tableClient.getEntity<Metadata>(uid, bid);

    if (!entity) {
      return null;
    }

    return entity;
  }

  async blob(path: string): Promise<Buffer> {
    const blobClient = this.containerClient.getBlockBlobClient(path);
    return await blobClient.downloadToBuffer();
  }
  async add(uid: string, bid: string, meta: Metadata, blob: Buffer) {
    const blobPath = `${uid}/${bid}.bin`;
    const blobClient = this.containerClient.getBlockBlobClient(blobPath);
    await blobClient.uploadData(blob);
    await this.tableClient.createEntity<Metadata>({
      ...meta,
      partitionKey: uid,
      rowKey: bid,
    });
  }

  async replace(
    uid: string,
    bid: string,
    meta: Metadata,
    blob?: Buffer
  ): Promise<void> {
    if (blob) {
      const blobClient = this.containerClient.getBlockBlobClient(meta.blobPath);
      await blobClient.uploadData(blob);
    }
    await this.tableClient.updateEntity({
      ...meta,
      partitionKey: uid,
      rowKey: bid,
    });
  }

  async remove(uid, bid, meta: Metadata): Promise<void> {
    const blobClient = this.containerClient.getBlockBlobClient(meta.blobPath);
    await this.tableClient.deleteEntity(uid, bid);
    await blobClient.delete();
  }
}

export type LogReason =
  | 'add'
  | 'replace'
  | 'remove'
  | 'extend'
  | 'authorized'
  | 'unauthorized';

export type LogRecord = Omit<
  TableEntityResult<{
    uid: string;
    bid: string;
    status: string;
    reason: string;
    ip: string;
  }>,
  'partitionKey' | 'rowKey' | 'etag'
>;

export interface ILogger {
  list(uid: string, skiptoken: string, pageSize: number): Promise<LogRecord[]>;
  log(
    uid: string,
    bid: string,
    title: string,
    status: 'close' | 'open',
    reason: LogReason,
    ip: string
  ): Promise<void>;
}

export class AzureStorageLogger implements ILogger {
  private tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    process.env.AZURE_STORAGE_LOG_TABLE_NAME
  );

  async list(
    uid: string,
    skiptoken: string,
    pageSize: number
  ): Promise<LogRecord[]> {
    const result: LogRecord[] = [];
    const pages = this.tableClient
      .listEntities<LogRecord>({
        queryOptions: {
          filter: odata`PartitionKey eq ${uid} and RowKey gt ${skiptoken}`,
        },
      })
      .byPage({ maxPageSize: pageSize });

    for await (const page of pages) {
      for await (const record of page) {
        result.push(record);
      }
      break;
    }
    return result;
  }

  async log(
    uid: string,
    bid: string,
    title: string,
    status: 'close' | 'open',
    reason: LogReason,
    ip: string
  ): Promise<void> {
    await this.tableClient.createEntity({
      partitionKey: uid,
      rowKey: String(Number.MAX_SAFE_INTEGER - new Date().getTime()),
      bid,
      title,
      status,
      reason,
      ip,
    });
  }

  async delall(
    uid: string,
    skiptoken: string,
    pageSize: number
  ): Promise<LogRecord[]> {
    const result: LogRecord[] = [];
    const pages = this.tableClient.listEntities<LogRecord>({
      queryOptions: {
        filter: odata`PartitionKey eq ${uid} and RowKey gt ${skiptoken}`,
      },
    });

    for await (const record of pages) {
      await this.tableClient.deleteEntity(record.partitionKey, record.rowKey);
    }
    return result;
  }
}

type Subscription = {
  json: string;
  expirationTime: number;
};
export interface ISubscriptionStore {
  set(
    uid: string,
    json: string,
    endpoint: string,
    expirationTime: number
  ): Promise<void>;
  get(uid: string, endpoint: string): Promise<string>;
  remove(uid: string, endpoint: string): Promise<void>;
  list(uid: string): Promise<Subscription[]>;
}
export class AzureStorageSubscriptionStore implements ISubscriptionStore {
  private tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING,
    process.env.AZURE_STORAGE_SUBSCRIPTION_TABLE_NAME
  );

  async set(
    uid: string,
    json: string,
    endpoint: string,
    expirationTime: number
  ): Promise<void> {
    const rowKey = createHash('sha1').update(endpoint).digest('hex');
    await this.tableClient.upsertEntity<Subscription>({
      partitionKey: uid,
      rowKey,
      json,
      expirationTime,
    });
  }
  async get(
    uid: string,
    endpoint: string,
    now: number = Date.now()
  ): Promise<string> {
    const rowKey = createHash('sha1').update(endpoint).digest('hex');
    const entity = await this.tableClient.getEntity<Subscription>(uid, rowKey);
    if (entity.expirationTime !== null && now >= entity.expirationTime) {
      return null;
    }
    return entity?.json;
  }
  async remove(uid: string, endpoint: string): Promise<void> {
    const rowKey = createHash('sha1').update(endpoint).digest('hex');
    const entity = await this.tableClient.getEntity<Subscription>(uid, rowKey);
    await this.tableClient.deleteEntity(uid, endpoint);
  }
  async list(uid: string, now: number = Date.now()): Promise<Subscription[]> {
    const result: Subscription[] = [];
    const removal: TableEntityResult<Subscription>[] = [];
    const pages = this.tableClient.listEntities<Subscription>({
      queryOptions: {
        filter: odata`PartitionKey eq ${uid}`,
      },
    });

    for await (const entity of pages) {
      if (entity.expirationTime !== null && now >= entity.expirationTime) {
        removal.push(entity);
      } else {
        result.push(entity);
      }
      break;
    }

    if (removal.length > 0) {
      const _ = this.tableClient.submitTransaction(
        removal.map(({ partitionKey, rowKey }) => [
          'delete',
          { partitionKey, rowKey },
        ])
      );
    }

    return result;
  }
}
