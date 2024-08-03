import { isNumber, isRecord, isString } from '@hatsuportal/common'
import { ThemeColors } from '@hatsuportal/contracts'
import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'

export interface ThemeColorsDTO {
  primary: string
  backgroundPrimary: string
  backgroundSecondary: string
  callToAction: string
}

export interface ThemeViewModelDTO {
  id: string
  name: string
  lightColors: ThemeColorsDTO
  darkColors: ThemeColorsDTO
  createdById: string
  createdAt: number
  updatedAt: number
}

export class ThemeViewModel {
  private _id: string
  private _name: string
  private _lightColors: ThemeColorsDTO
  private _darkColors: ThemeColorsDTO
  private _createdById: string
  private _createdAt: number
  private _updatedAt: number

  constructor(theme: ThemeViewModelDTO) {
    if (!isString(theme.id)) {
      throw new InvalidViewModelPropertyError(`Property "id" must be a string, was '${theme.id}'`)
    }
    if (!isString(theme.name)) {
      throw new InvalidViewModelPropertyError(`Property "name" must be a string, was '${theme.name}'`)
    }
    if (!isRecord(theme.lightColors)) {
      throw new InvalidViewModelPropertyError(`Property "lightColors" must be a ThemeColorsDTO, was '${theme.lightColors}'`)
    }
    if (!isRecord(theme.darkColors)) {
      throw new InvalidViewModelPropertyError(`Property "darkColors" must be a ThemeColorsDTO, was '${theme.darkColors}'`)
    }
    if (!isString(theme.createdById)) {
      throw new InvalidViewModelPropertyError(`Property "createdById" must be a string, was '${theme.createdById}'`)
    }
    if (!isNumber(theme.createdAt)) {
      throw new InvalidViewModelPropertyError(`Property "createdAt" must be a number, was '${theme.createdAt}'`)
    }
    if (!isNumber(theme.updatedAt)) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${theme.updatedAt}'`)
    }
    this._id = theme.id
    this._name = theme.name
    this._lightColors = theme.lightColors
    this._darkColors = theme.darkColors
    this._createdById = theme.createdById
    this._createdAt = theme.createdAt
    this._updatedAt = theme.updatedAt
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get lightColors(): ThemeColorsDTO {
    return this._lightColors
  }

  get darkColors(): ThemeColorsDTO {
    return this._darkColors
  }

  get createdById(): string {
    return this._createdById
  }

  get displayColors(): ThemeColors {
    return {
      lightColors: this._lightColors,
      darkColors: this._darkColors
    }
  }

  get createdAt(): number {
    return this._createdAt
  }

  get updatedAt(): number {
    return this._updatedAt
  }

  public toJSON(): ThemeViewModelDTO {
    return {
      id: this._id,
      name: this._name,
      lightColors: this._lightColors,
      darkColors: this._darkColors,
      createdById: this._createdById,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }
}
