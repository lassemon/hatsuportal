import { CssColor } from './CssColor'

export interface ThemeColorsProps {
  primary: CssColor
  backgroundPrimary: CssColor
  backgroundSecondary: CssColor
  callToAction: CssColor
}

export interface ThemeColorsSerialized {
  primary: string
  backgroundPrimary: string
  backgroundSecondary: string
  callToAction: string
}

export class ThemeColors {
  readonly primary: CssColor
  readonly backgroundPrimary: CssColor
  readonly backgroundSecondary: CssColor
  readonly callToAction: CssColor

  constructor(props: ThemeColorsProps) {
    this.primary = props.primary
    this.backgroundPrimary = props.backgroundPrimary
    this.backgroundSecondary = props.backgroundSecondary
    this.callToAction = props.callToAction
  }

  static reconstruct(props: ThemeColorsSerialized): ThemeColors {
    return new ThemeColors({
      primary: new CssColor(props.primary),
      backgroundPrimary: new CssColor(props.backgroundPrimary),
      backgroundSecondary: new CssColor(props.backgroundSecondary),
      callToAction: new CssColor(props.callToAction)
    })
  }

  equals(other: unknown): boolean {
    return (
      other instanceof ThemeColors &&
      this.primary.equals(other.primary) &&
      this.backgroundPrimary.equals(other.backgroundPrimary) &&
      this.backgroundSecondary.equals(other.backgroundSecondary) &&
      this.callToAction.equals(other.callToAction)
    )
  }

  serialize(): ThemeColorsSerialized {
    return {
      primary: this.primary.value,
      backgroundPrimary: this.backgroundPrimary.value,
      backgroundSecondary: this.backgroundSecondary.value,
      callToAction: this.callToAction.value
    }
  }
}
