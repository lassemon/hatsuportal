import { beforeEach, describe, expect, it } from 'vitest'
import { vol } from 'memfs'
import { FileSystemImageStorageService } from './FileSystemImageStorageService'
import { promises as fs } from 'node:fs'
import { FileName } from '@hatsuportal/media-management'
import { BASE64_PNG_PREFIX } from '@hatsuportal/platform'

const imagesBasePath = process.env.IMAGES_BASE_PATH || './images'

/**
 * This test requires the mocking of node:fs with vol.
 * See setup.unit.ts for the mocking.
 */

describe('ImageStorageService', () => {
  beforeEach(() => {
    vol.reset()
    vol.fromJSON({
      [`${imagesBasePath}/filename.png`]: 'This is a file that exists'
    })
  })

  const imageStorageService = new FileSystemImageStorageService()

  it('writes image buffer to file', async ({ unitFixture }) => {
    const buffer = unitFixture.base64ImageBufferMock()
    await imageStorageService.storeImageBuffer(buffer, new FileName('filename.png'))
    const savedFile = await fs.readFile(`${imagesBasePath}/filename.png`)
    expect(savedFile).toStrictEqual(buffer)
  })

  it('can read image from file system', async ({ unitFixture }) => {
    const buffer = unitFixture.base64ImageBufferMock()
    await fs.writeFile(`${imagesBasePath}/filename.png`, buffer)
    const savedFile = await imageStorageService.getImage(new FileName('filename.png'))
    expect(savedFile).toStrictEqual(`${BASE64_PNG_PREFIX},${buffer.toString('base64')}`)
  })

  it('can remove image from file system', async ({ unitFixture }) => {
    expect(vol.existsSync(`${imagesBasePath}/filename.png`)).toBe(true)
    await imageStorageService.deleteImage(new FileName('filename.png'))
    expect(vol.existsSync(`${imagesBasePath}/filename.png`)).toBe(false)
  })
})
