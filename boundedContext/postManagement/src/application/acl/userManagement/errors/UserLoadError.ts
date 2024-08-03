export interface UserLoadErrorProps {
  userId: string
  error: Error
}

export class UserLoadError {
  private readonly _userId: string
  private readonly _error: Error

  public constructor(props: UserLoadErrorProps) {
    this._userId = props.userId
    this._error = props.error
  }

  get userId(): string {
    return this._userId
  }

  get error(): Error {
    return this._error
  }

  getProps(): UserLoadErrorProps {
    return {
      userId: this._userId,
      error: this._error
    }
  }
}
