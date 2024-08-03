import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface ImageLoadErrorProps {
  imageId: string
  error: Error
}

export class ImageLoadError {
  private _imageId: NonEmptyString
  private _error: Error

  public constructor(props: ImageLoadErrorProps) {
    this._imageId = new NonEmptyString(props.imageId)
    this._error = props.error
  }

  get imageId(): NonEmptyString {
    return this._imageId
  }

  get error(): Error {
    return this._error
  }

  getProps(): ImageLoadErrorProps {
    return {
      imageId: this._imageId.value,
      error: this._error
    }
  }
}
