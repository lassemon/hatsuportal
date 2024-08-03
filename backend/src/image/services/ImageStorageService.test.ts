import { beforeEach, describe, expect, it } from 'vitest'
import { vol } from 'memfs'
import { ImageStorageService } from './ImageStorageService'
import { promises as fs } from 'node:fs'

const imagesBasePath = './images'

describe('ImageStorageService', () => {
  beforeEach(() => {
    vol.fromJSON({
      [`${imagesBasePath}/filename.png`]: 'This is a file that exists'
    })
  })

  const imageStorageService = new ImageStorageService()

  it('writes image buffer to file', async ({ unitFixture }) => {
    const buffer = unitFixture.base64ImageBuffer()
    await imageStorageService.writeImageBufferToFile(buffer, 'filename.png')
    const savedFile = await fs.readFile(`${imagesBasePath}/filename.png`)
    expect(savedFile).toStrictEqual(buffer)
  })

  it('can read image from file system', async ({ unitFixture }) => {
    const buffer = unitFixture.base64ImageBuffer()
    await fs.writeFile(`${imagesBasePath}/filename.png`, buffer)
    const savedFile = await imageStorageService.getImageFromFileSystem('filename.png')
    expect(savedFile).toStrictEqual(buffer.toString('base64'))
  })

  it('can remove image from file system', async ({ unitFixture }) => {
    expect(vol.existsSync(`${imagesBasePath}/filename.png`)).toBe(true)
    await imageStorageService.deleteImageFromFileSystem('filename.png')
    expect(vol.existsSync(`${imagesBasePath}/filename.png`)).toBe(false)
  })
})
