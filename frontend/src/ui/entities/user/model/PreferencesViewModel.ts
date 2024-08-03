import { isBoolean, isString } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'

export interface PreferencesViewModelDTO {
  colorScheme: string
  selectedThemeId: string
  notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }
}

export class PreferencesViewModel {
  private _colorScheme: string
  private _selectedThemeId: string
  private _notificationSettings: {
    emailNotifications: boolean
    pushNotifications: boolean
  }

  constructor(props: PreferencesViewModelDTO) {
    if (!isString(props.colorScheme)) {
      throw new InvalidViewModelPropertyError(`Property "colorScheme" must be a string, was '${props.colorScheme}'`)
    }
    if (!isString(props.selectedThemeId)) {
      throw new InvalidViewModelPropertyError(`Property "selectedThemeId" must be a string, was '${props.selectedThemeId}'`)
    }
    if (!isBoolean(props.notificationSettings.emailNotifications)) {
      throw new InvalidViewModelPropertyError('Property "notificationSettings.emailNotifications" must be a boolean')
    }
    if (!isBoolean(props.notificationSettings.pushNotifications)) {
      throw new InvalidViewModelPropertyError('Property "notificationSettings.pushNotifications" must be a boolean')
    }
    this._colorScheme = props.colorScheme
    this._selectedThemeId = props.selectedThemeId
    this._notificationSettings = props.notificationSettings
  }

  get colorScheme(): string {
    return this._colorScheme
  }

  get selectedThemeId(): string {
    return this._selectedThemeId
  }

  get notificationSettings(): { emailNotifications: boolean; pushNotifications: boolean } {
    return this._notificationSettings
  }
}
