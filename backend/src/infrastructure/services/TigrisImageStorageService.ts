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

export class TigrisImageStorageService implements IImageStorageService {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly objectPrefix: string

  constructor(basePath: string) {
    this.bucket = process.env.BUCKET_NAME || ''
    this.objectPrefix = toObjectStoragePrefix(basePath)
    this.client = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3 || 'https://t3.storage.dev',
      region: process.env.AWS_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  }

  async storeImageBuffer(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: this.toObjectKey(storageKey.value),
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
          Key: this.toObjectKey(storageKey.value)
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

  async copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void> {
    try {
      const sourceObjectKey = this.toObjectKey(sourceStorageKey.value)
      const destinationObjectKey = this.toObjectKey(destinationStorageKey.value)
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${sourceObjectKey}`,
          Key: destinationObjectKey
        })
      )
    } catch (error) {
      if (isS3AlreadyExists(error)) {
        return
      }
      throw new DataPersistenceError({
        message: `Error copying ${sourceStorageKey} to ${destinationStorageKey} in Tigris`,
        cause: error
      })
    }
  }

  async deleteImage(storageKey: NonEmptyString): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: this.toObjectKey(storageKey.value)
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
            Prefix: this.objectPrefix,
            ContinuationToken: continuationToken
          })
        )
        for (const obj of response.Contents ?? []) {
          if (!obj.Key) continue
          const logicalKey = this.fromObjectKey(obj.Key)
          if (!logicalKey) continue
          keys.push({ key: logicalKey, lastModified: obj.LastModified ?? new Date() })
        }
        continuationToken = response.NextContinuationToken
      } while (continuationToken)
    } catch (error) {
      throw new DataPersistenceError({ message: 'Error listing objects in Tigris bucket', cause: error })
    }

    return keys
  }

  /**
   * Maps a logical storage key (as stored in the database) to the full S3 object key.
   *
   * The database and domain layer use flat filenames without a bucket prefix. Tigris stores
   * objects under the configured images folder (e.g. `images/`).
   *
   * @param storageKey - Logical key from the DB / domain layer.
   * @returns Full S3 object key, including the images prefix when absent.
   *
   * @example
   * // objectPrefix is `images/`
   * toObjectKey('story_cover_abc_v1_user.webp')
   * // => 'images/story_cover_abc_v1_user.webp'
   *
   * @example
   * // Idempotent when the prefix is already present
   * toObjectKey('images/story_cover_abc_v1_user.webp')
   * // => 'images/story_cover_abc_v1_user.webp'
   */
  private toObjectKey(storageKey: string): string {
    if (storageKey.startsWith(this.objectPrefix)) return storageKey
    return `${this.objectPrefix}${storageKey}`
  }

  /**
   * Maps an S3 object key back to the logical storage key used by the database.
   *
   * Used when listing bucket objects so callers receive the same key format as
   * {@link IImageRepository.findAllStorageKeys}, not the raw object path.
   *
   * @param objectKey - Full S3 object key from a list/get response.
   * @returns Logical storage key with the images prefix removed, or `null` if the object
   *   lies outside the images prefix (e.g. `backups/…`, `videos/…`).
   *
   * @example
   * // objectPrefix is `images/`
   * fromObjectKey('images/story_cover_abc_v1_user.webp')
   * // => 'story_cover_abc_v1_user.webp'
   *
   * @example
   * fromObjectKey('backups/2026-07-20.sql.gz')
   * // => null
   */
  private fromObjectKey(objectKey: string): string | null {
    if (!objectKey.startsWith(this.objectPrefix)) return null
    return objectKey.slice(this.objectPrefix.length)
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function isS3AlreadyExists(error: unknown): boolean {
  return error instanceof Error && 'name' in error && error.name === 'ConditionalRequestConflict'
}

function isS3NotFound(error: unknown): boolean {
  return error instanceof Error && 'name' in error && (error.name === 'NoSuchKey' || error.name === 'NotFound')
}

function toObjectStoragePrefix(basePath: string): string {
  return `${normalizeImagesBasePath(basePath)}/`
}

function normalizeImagesBasePath(basePath: string): string {
  return basePath.replace(/^\.\//, '').replace(/\/$/, '')
}
