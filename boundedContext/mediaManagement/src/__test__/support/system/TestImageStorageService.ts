import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { IImageStorageService, MediaStorageKeyEntry } from '../../../application/services/IImageStorageService'

export class TestImageStorageService implements IImageStorageService {
  private readonly rootDir: string

  constructor(rootDir?: string) {
    this.rootDir = rootDir ?? join(tmpdir(), `hatsu-media-test-${randomUUID()}`)
    mkdirSync(this.rootDir, { recursive: true })
  }

  async seed(storageKey: string, base64Payload: string): Promise<void> {
    await this.storeImageBuffer(Buffer.from(base64Payload, 'utf8'), new NonEmptyString(storageKey))
  }

  destroy(): void {
    rmSync(this.rootDir, { recursive: true, force: true })
  }

  private filePath(storageKey: NonEmptyString): string {
    return join(this.rootDir, storageKey.value.replace(/[/\\:]/g, '_'))
  }

  async storeImageBuffer(imageBuffer: Buffer, storageKey: NonEmptyString): Promise<void> {
    writeFileSync(this.filePath(storageKey), imageBuffer)
  }

  async getImage(storageKey: NonEmptyString): Promise<string> {
    return readFileSync(this.filePath(storageKey), 'utf8')
  }

  async copyImage(sourceStorageKey: NonEmptyString, destinationStorageKey: NonEmptyString): Promise<void> {
    const contents = await this.getImage(sourceStorageKey)
    await this.storeImageBuffer(Buffer.from(contents, 'utf8'), destinationStorageKey)
  }

  async deleteImage(storageKey: NonEmptyString): Promise<void> {
    rmSync(this.filePath(storageKey), { force: true })
  }

  async listAllStorageKeys(): Promise<MediaStorageKeyEntry[]> {
    const entries = readdirSync(this.rootDir)
    return entries.map((entry) => {
      const fullPath = join(this.rootDir, entry)
      const stats = statSync(fullPath)
      return {
        key: entry,
        lastModified: stats.mtime
      }
    })
  }
}
