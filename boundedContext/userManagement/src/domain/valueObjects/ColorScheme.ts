import { ValueObject } from '@hatsuportal/shared-kernel'

export enum ColorSchemeEnum {
  Light = 'light',
  Dark = 'dark'
}

export class ColorScheme extends ValueObject<ColorSchemeEnum> {
  constructor(public readonly value: ColorSchemeEnum) {
    super()
    if (value !== ColorSchemeEnum.Light && value !== ColorSchemeEnum.Dark) {
      throw new Error(`Invalid color scheme: ${value}`)
    }
    this.value = value
  }

  static default(): ColorScheme {
    return new ColorScheme(ColorSchemeEnum.Light)
  }

  equals(other: unknown): boolean {
    return other instanceof ColorScheme && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
