import ValueObject from './ValueObject'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { InvalidFileNameError } from '../errors/InvalidFileNameError'

export class FileName extends ValueObject<string> {
  static canCreate(value: string): boolean {
    try {
      FileName.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(value: string): void {
    new FileName(value)
  }
  /**
   * Returns a temporary filename that keeps the same extension
   * and therefore remains valid under the same validation rules.
   *  photo.jpg   →   photo.tmp.jpg
   */
  static createTemporaryFileName(original: FileName): FileName {
    return new FileName(`${original.name}.tmp.${original.extension}`)
  }

  constructor(public readonly value: string) {
    super()

    if (isNonStringOrEmpty(value)) throw new InvalidFileNameError(`Value '${value}' is not a valid file name.`)

    const forbiddenCharacters = /[\/\\:\*\?"<>\|]/
    const pattern = /^[^\s\\/:\*\?"<>\|]+\.[^\s\\/:\*\?"<>\|]+$/
    if (forbiddenCharacters.test(value) || !pattern.test(value))
      throw new InvalidFileNameError(`Value '${value}' is not a valid file name.`)

    this.value = value.replaceAll(' ', '').toLowerCase()
  }

  get name(): string {
    return this.value.substring(0, this.value.lastIndexOf('.'))
  }

  get extension(): string {
    return this.value.substring(this.value.lastIndexOf('.') + 1)
  }

  equals(other: unknown): boolean {
    return other instanceof FileName && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
