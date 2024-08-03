import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface EntityLoadErrorProps {
  entityId: string
  error: Error
}

export class EntityLoadError {
  private readonly _entityId: NonEmptyString
  private readonly _error: Error

  public constructor(props: EntityLoadErrorProps) {
    this._entityId = new NonEmptyString(props.entityId)
    this._error = props.error
  }

  get entityId(): NonEmptyString {
    return this._entityId
  }

  get error(): Error {
    return this._error
  }

  getProps(): EntityLoadErrorProps {
    return {
      entityId: this._entityId.value,
      error: this._error
    }
  }
}
