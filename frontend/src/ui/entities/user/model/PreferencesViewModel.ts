import { ColorSchemeEnum, isBoolean, isString, validateAndCastEnum } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'
import { ThemeViewModel, ThemeViewModelDTO } from './ThemeViewModel'

export interface PreferencesViewModelDTO {
  colorScheme: `${ColorSchemeEnum}`
  selectedTheme: ThemeViewModelDTO
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

export class PreferencesViewModel {
  private _colorScheme: `${ColorSchemeEnum}`
  private _selectedTheme: ThemeViewModel
  private _notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }

  constructor(props: PreferencesViewModelDTO) {
    if (!isString(props.colorScheme)) {
      throw new InvalidViewModelPropertyError(`Property "colorScheme" must be a string, was '${props.colorScheme}'`)
    }
    if (!isBoolean(props.notificationSettings.emailNotifications)) {
      throw new InvalidViewModelPropertyError('Property "notificationSettings.emailNotifications" must be a boolean')
    }
    if (!isBoolean(props.notificationSettings.pushNotifications)) {
      throw new InvalidViewModelPropertyError('Property "notificationSettings.pushNotifications" must be a boolean')
    }
    this._colorScheme = validateAndCastEnum(props.colorScheme, ColorSchemeEnum)
    this._selectedTheme = new ThemeViewModel(props.selectedTheme)
    this._notificationSettings = props.notificationSettings
  }

  get colorScheme(): `${ColorSchemeEnum}` {
    return this._colorScheme
  }

  get selectedTheme(): ThemeViewModel {
    return this._selectedTheme
  }

  get notificationSettings(): { emailNotifications: boolean; pushNotifications: boolean } {
    return this._notificationSettings
  }

  public toJSON(): PreferencesViewModelDTO {
    return {
      colorScheme: this._colorScheme,
      selectedTheme: this._selectedTheme.toJSON(),
      notificationSettings: this._notificationSettings
    }
  }
}
