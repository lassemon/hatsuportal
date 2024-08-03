import { unixtimeNow } from '@hatsuportal/common'
import {
  CreatedAtTimestamp,
  DomainEvent,
  Entity,
  EntityProps,
  UniqueId,
  UnixTimestamp,
  InvalidCreatedAtTimestampError
} from '@hatsuportal/shared-kernel'
import { dateStringFromUnixTime } from '@hatsuportal/common'
import { CannotDeleteDefaultThemeError } from '../errors/CannotDeleteDefaultThemeError'
import { DefaultThemeId } from '../valueObjects/DefaultThemeId'
import { ThemeColors } from '../valueObjects/ThemeColors'
import { ThemeId } from '../valueObjects/ThemeId'
import { ThemeName } from '../valueObjects/ThemeName'
import { UserId } from '../valueObjects/UserId'

export interface ThemeProps extends EntityProps {
  name: ThemeName
  lightColors: ThemeColors
  darkColors: ThemeColors
  createdById: UserId
}

export class Theme extends Entity {
  static canCreate(props: unknown): boolean {
    try {
      Theme.assertCanCreate(props)
      return true
    } catch {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Theme(
      props.id instanceof ThemeId ? props.id : new ThemeId(props.id),
      props.name instanceof ThemeName ? props.name : new ThemeName(props.name),
      props.lightColors instanceof ThemeColors ? props.lightColors : ThemeColors.reconstruct(props.lightColors),
      props.darkColors instanceof ThemeColors ? props.darkColors : ThemeColors.reconstruct(props.darkColors),
      props.createdById instanceof UserId ? props.createdById : new UserId(props.createdById),
      props.createdAt instanceof CreatedAtTimestamp ? props.createdAt : new CreatedAtTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: ThemeProps): Theme {
    return new Theme(props.id, props.name, props.lightColors, props.darkColors, props.createdById, props.createdAt, props.updatedAt)
  }

  static reconstruct(props: ThemeProps): Theme {
    return new Theme(props.id, props.name, props.lightColors, props.darkColors, props.createdById, props.createdAt, props.updatedAt)
  }

  private _name: ThemeName
  private _lightColors: ThemeColors
  private _darkColors: ThemeColors
  private _createdById: UserId

  private constructor(
    id: ThemeId,
    name: ThemeName,
    lightColors: ThemeColors,
    darkColors: ThemeColors,
    createdById: UserId,
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)
    this._name = name
    this._lightColors = lightColors
    this._darkColors = darkColors
    this._createdById = createdById

    if (createdAt.value > updatedAt.value && !updatedAt.equals(UnixTimestamp.UNKNOWN)) {
      throw new InvalidCreatedAtTimestampError(
        `createdAt ${dateStringFromUnixTime(createdAt.value)} must be before updatedAt ${dateStringFromUnixTime(updatedAt.value)}`
      )
    }
  }

  get name(): ThemeName {
    return this._name
  }

  get lightColors(): ThemeColors {
    return this._lightColors
  }

  get darkColors(): ThemeColors {
    return this._darkColors
  }

  get createdById(): UserId {
    return this._createdById
  }

  rename(name: ThemeName): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  updateLightColors(colors: ThemeColors): void {
    this._lightColors = colors
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  updateDarkColors(colors: ThemeColors): void {
    this._darkColors = colors
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  delete(_deletedById: UniqueId): void {
    if (this.id.value === new DefaultThemeId().value) {
      throw new CannotDeleteDefaultThemeError()
    }
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  clearEvents(): void {
    this._domainEvents = []
  }

  addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  public clone(): Theme {
    return new Theme(
      this.id as ThemeId,
      this._name,
      this._lightColors,
      this._darkColors,
      this._createdById,
      this.createdAt,
      this._updatedAt
    )
  }

  equals(other: unknown): boolean {
    return (
      other instanceof Theme &&
      this.id.equals(other.id) &&
      this._name.equals(other._name) &&
      this._lightColors.equals(other._lightColors) &&
      this._darkColors.equals(other._darkColors) &&
      this._createdById.equals(other._createdById) &&
      this.createdAt.equals(other.createdAt)
    )
  }

  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      name: this._name.value,
      lightColors: this._lightColors.serialize(),
      darkColors: this._darkColors.serialize(),
      createdById: this._createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }
}
