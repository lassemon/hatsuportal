import { isNumber } from '@hatsuportal/common'
import { InvalidPresentationPropertyError } from '@hatsuportal/presentation-common'

export interface ProfilePresentationDTO {
  storiesCreated: number
}

export class ProfilePresentation {
  private _storiesCreated: number

  constructor(props: ProfilePresentationDTO) {
    if (!isNumber(props.storiesCreated)) {
      throw new InvalidPresentationPropertyError(`Property "storiesCreated" must be a number, was '${props.storiesCreated}'`)
    }
    this._storiesCreated = props.storiesCreated
  }

  get storiesCreated(): number {
    return this._storiesCreated
  }
}
