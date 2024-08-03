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
    const invalidFileSizes = [0, -2, -12456, '1', '0', '-1'] as any[]

    invalidFileSizes.forEach((fileSize) => {
      expect(() => {
        new FileSize(fileSize)
      }).toThrow(InvalidFileSizeError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    expect(FileSize.canCreate(10)).toBe(true)
    expect(() => FileSize.assertCanCreate(10)).not.toThrow()
    expect(FileSize.canCreate(0)).toBe(false)
    expect(() => FileSize.assertCanCreate(0)).toThrow(InvalidFileSizeError)
    expect(FileSize.UNKNOWN.value).toBe(-1)
    expect(new FileSize(10).equals(new FileSize(10))).toBe(true)
    expect(new FileSize(10).toString()).toBe('10')
  })
})
