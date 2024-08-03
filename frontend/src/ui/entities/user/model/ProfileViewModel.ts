import { isString } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'

export interface ProfileViewModelDTO {
  bio: string
  statusMessage: string
  profileImageId: string | null
}

export class ProfileViewModel {
  private _bio: string
  private _statusMessage: string
  private _profileImageId: string | null

  constructor(props: ProfileViewModelDTO) {
    if (!isString(props.bio)) {
      throw new InvalidViewModelPropertyError(`Property "bio" must be a string, was '${props.bio}'`)
    }
    if (!isString(props.statusMessage)) {
      throw new InvalidViewModelPropertyError(`Property "statusMessage" must be a string, was '${props.statusMessage}'`)
    }
    if (props.profileImageId !== null && !isString(props.profileImageId)) {
      throw new InvalidViewModelPropertyError(`Property "profileImageId" must be a string or null, was '${props.profileImageId}'`)
    }
    this._bio = props.bio
    this._statusMessage = props.statusMessage
    this._profileImageId = props.profileImageId
  }

  get bio(): string {
    return this._bio
  }

  get statusMessage(): string {
    return this._statusMessage
  }

  get profileImageId(): string | null {
    return this._profileImageId
  }
}
