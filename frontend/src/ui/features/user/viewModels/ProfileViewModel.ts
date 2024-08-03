import { isNumber } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'

export interface ProfileViewModelDTO {
  storiesCreated: number
}

export class ProfileViewModel {
  private _storiesCreated: number

  constructor(props: ProfileViewModelDTO) {
    if (!isNumber(props.storiesCreated)) {
      throw new InvalidViewModelPropertyError(`Property "storiesCreated" must be a number, was '${props.storiesCreated}'`)
    }
    this._storiesCreated = props.storiesCreated
  }

  get storiesCreated(): number {
    return this._storiesCreated
  }
}
