import { ImageStateEnum, isEnumValue } from '@hatsuportal/common'

export class ImageState {
  constructor(public readonly value: ImageStateEnum) {
    if (!isEnumValue(value, ImageStateEnum)) {
      throw new Error(`Invalid image state: ${value}`)
    }
  }

  isAvailable(): boolean {
    return this.value === ImageStateEnum.Available
  }

  isFailedToLoad(): boolean {
    return this.value === ImageStateEnum.FailedToLoad
  }

  isNotSet(): boolean {
    return this.value === ImageStateEnum.NotSet
  }

  equals(other: ImageState): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
