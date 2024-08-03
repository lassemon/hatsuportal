import { isNumber } from '@hatsuportal/common'
import { InvalidPresentationPostValueError } from '../errors/InvalidPresentationPostValueError'

export interface ProfilePresentationDTO {
  storiesCreated: number
}

export class ProfilePresentation {
  private _storiesCreated: number

  constructor(props: ProfilePresentationDTO) {
    if (!isNumber(props.storiesCreated)) {
      throw new InvalidPresentationPostValueError(`Property "storiesCreated" must be a number, was '${props.storiesCreated}'`)
    }
    this._storiesCreated = props.storiesCreated
  }

  get storiesCreated(): number {
    return this._storiesCreated
  }
}
