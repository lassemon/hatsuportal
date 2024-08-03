import { describe, expect, it } from 'vitest'
import { InvalidFileSizeError } from '../errors/InvalidFileSizeError'
import { FileSize } from './FileSize'

describe('FileSize', () => {
  it('can create a file size', () => {
    const fileName = new FileSize(123)
    expect(fileName).to.be.instanceOf(FileSize)
    expect(fileName.value).to.eq(123)
  })

  it('does not allow creating a file size with an empty value', () => {
    expect(() => {
      new FileSize('' as any)
    }).toThrow(InvalidFileSizeError)
    expect(() => {
      new FileSize(undefined as any)
    }).toThrow(InvalidFileSizeError)
    expect(() => {
      new FileSize(null as any)
    }).toThrow(InvalidFileSizeError)
  })

  it('does not allow creating a file size with an invalid value', () => {
    const invalidFileSizes = [0, -1, -12456, '1', '0', '-1'] as any[]

    invalidFileSizes.forEach((fileSize) => {
      expect(() => {
        new FileSize(fileSize)
      }).toThrow(InvalidFileSizeError)
    })
  })
})
