import { ImageId } from '../valueObjects/ImageId'

export interface ImageLoadErrorProps {
  imageId: string
  error: Error
}

export class ImageLoadError {
  private _imageId: ImageId
  private _error: Error

  public constructor(props: ImageLoadErrorProps) {
    this._imageId = new ImageId(props.imageId)
    this._error = props.error
  }

  get imageId(): ImageId {
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
