import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import { IImageStorageService, MediaStorageKeyEntry } from '@hatsuportal/media-management'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { BASE64_PNG_PREFIX, DataPersistenceError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('TigrisImageStorageService')

// always the same, no need to configure
const TIGIR_ENDPOINT = 'https://t3.storage.dev'

export class TigrisImageStorageService implements IImageStorageService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor() {
    this.bucket = process.env.TIGRIS_BUCKET_NAME || ''
    this.client = new S3Client({
      endpoint: TIGIR_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY || ''
      }
    })
  }

  async storeImageBuffer(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value,
          Body: imageBuffer
        })
      )
    } catch (error) {
      throw new DataPersistenceError({ message: `Error uploading ${storageKey} to Tigris`, cause: error })
    }
  }

  async getImage(storageKey: NonEmptyString): Promise<string> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value
        })
      )
      const buffer = Buffer.from(await streamToBuffer(response.Body as Readable))
      let imageBase64 = buffer.toString('base64')
      if (!imageBase64.startsWith(BASE64_PNG_PREFIX)) imageBase64 = `${BASE64_PNG_PREFIX},${imageBase64}`
      return imageBase64
    } catch (error: unknown) {
      if (isS3NotFound(error)) {
        throw new NotFoundError({ message: `Object ${storageKey} not found in Tigris`, cause: error })
      }
      throw new DataPersistenceError({ message: `Error downloading ${storageKey} from Tigris`, cause: error })
    }
  }

  async renameImage(oldStorageKey: NonEmptyString, newStorageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${oldStorageKey.value}`,
          Key: newStorageKey.value
        })
      )
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: oldStorageKey.value
        })
      )
    } catch (error) {
      throw new DataPersistenceError({ message: `Error renaming ${oldStorageKey} to ${newStorageKey} in Tigris`, cause: error })
    }
  }

  async deleteImage(storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storageKey.value
        })
      )
      logger.debug('Object removed from Tigris', storageKey.value)
    } catch (error) {
      throw new DataPersistenceError({ message: `Error deleting ${storageKey} from Tigris`, cause: error })
    }
  }

  async listAllStorageKeys(): Promise<MediaStorageKeyEntry[]> {
    const keys: MediaStorageKeyEntry[] = []
    let continuationToken: string | undefined

    try {
      do {
        const response = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucket,
            ContinuationToken: continuationToken
          })
        )
        for (const obj of response.Contents ?? []) {
          if (obj.Key) keys.push({ key: obj.Key, lastModified: obj.LastModified ?? new Date() })
        }
        continuationToken = response.NextContinuationToken
      } while (continuationToken)
    } catch (error) {
      throw new DataPersistenceError({ message: 'Error listing objects in Tigris bucket', cause: error })
    }

    return keys
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function isS3NotFound(error: unknown): boolean {
  return error instanceof Error && 'name' in error && (error.name === 'NoSuchKey' || error.name === 'NotFound')
}
