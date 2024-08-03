export interface ThemeColorsProps {
  primary: string
  backgroundPrimary: string
  backgroundSecondary: string
  callToAction: string
}

export class ThemeColors {
  readonly primary: string
  readonly backgroundPrimary: string
  readonly backgroundSecondary: string
  readonly callToAction: string

  constructor(props: ThemeColorsProps) {
    this.primary = props.primary
    this.backgroundPrimary = props.backgroundPrimary
    this.backgroundSecondary = props.backgroundSecondary
    this.callToAction = props.callToAction
  }

  static reconstruct(props: ThemeColorsProps): ThemeColors {
    return new ThemeColors(props)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof ThemeColors &&
      this.primary === other.primary &&
      this.backgroundPrimary === other.backgroundPrimary &&
      this.backgroundSecondary === other.backgroundSecondary &&
      this.callToAction === other.callToAction
    )
  }

  serialize(): ThemeColorsProps {
    return {
      primary: this.primary,
      backgroundPrimary: this.backgroundPrimary,
      backgroundSecondary: this.backgroundSecondary,
      callToAction: this.callToAction
    }
  }
}
