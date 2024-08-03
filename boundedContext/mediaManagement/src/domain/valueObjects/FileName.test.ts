import { describe, expect, it } from 'vitest'
import { FileName } from './FileName'
import { InvalidFileNameError } from '../errors/InvalidFileNameError'

describe('FileName', () => {
  it('can create a file name', () => {
    const fileName = new FileName('test.png')
    expect(fileName).to.be.instanceOf(FileName)
    expect(fileName.value).to.eq('test.png')
  })

  it('does not allow creating a file name with an empty value', () => {
    expect(() => {
      new FileName('' as any)
    }).toThrow(InvalidFileNameError)
    expect(() => {
      new FileName(undefined as any)
    }).toThrow(InvalidFileNameError)
    expect(() => {
      new FileName(null as any)
    }).toThrow(InvalidFileNameError)
  })

  it('does not allow creating a file name with an invalid value', () => {
    const invalidFileNames = [
      '   ',
      'file',
      '.hiddenfile',
      'file.',
      'file/name.txt',
      'file\\name.txt',
      'file:name.txt',
      'file*name.txt',
      'file?name.txt',
      'file"name.txt',
      'file<name>.txt',
      'file|name.txt',
      1,
      0,
      -1
    ] as any[]

    invalidFileNames.forEach((fileName) => {
      expect(() => {
        new FileName(fileName)
      }).toThrow(InvalidFileNameError)
    })
  })
})
