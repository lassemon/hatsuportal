import { ImageStateEnum, isEnumValue } from '@hatsuportal/common'

export class ImageState {
  private readonly _value: ImageStateEnum

  constructor(value: ImageStateEnum) {
    if (!isEnumValue(value, ImageStateEnum)) {
      throw new Error(`Invalid image state: ${value}`)
    }
    this._value = value
  }

  get value(): ImageStateEnum {
    return this._value
  }

  isAvailable(): boolean {
    return this._value === ImageStateEnum.Available
  }

  isFailedToLoad(): boolean {
    return this._value === ImageStateEnum.FailedToLoad
  }

  isNotSet(): boolean {
    return this._value === ImageStateEnum.NotSet
  }

  equals(other: ImageState): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
