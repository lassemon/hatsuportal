import { ImageStateEnum } from '@hatsuportal/common'
import { Image } from '../entities/Image'
import { InvalidImageLoadResultError } from '../errors/InvalidImageLoadResultError'
import { ImageId } from '../valueObjects/ImageId'
import { ImageLoadError, ImageLoadErrorProps } from './ImageLoadError'
import { ImageState } from './ImageState'

export interface ImageLoadResultProps {
  image: Image | null
  state: ImageStateEnum
  loadError?: ImageLoadErrorProps | null
}

export class ImageLoadResult {
  private _image: Image | null
  private _state: ImageState
  private _loadError: ImageLoadError | null

  private constructor(props: ImageLoadResultProps) {
    if (!props.image && props.state === ImageStateEnum.Available) {
      throw new InvalidImageLoadResultError(`Cannot set state to "available" without an image`)
    }
    if (props.image && props.state === ImageStateEnum.FailedToLoad) {
      throw new InvalidImageLoadResultError(`Cannot set state to "failed to load" with an image`)
    }
    if (props.image && props.state === ImageStateEnum.NotSet) {
      throw new InvalidImageLoadResultError(`Cannot set state to "not set" with an image`)
    }
    if (props.loadError && props.state === ImageStateEnum.Available) {
      throw new InvalidImageLoadResultError(`Cannot set state to "available" with a load error`)
    }
    if (props.loadError && props.state === ImageStateEnum.NotSet) {
      throw new InvalidImageLoadResultError(`Cannot set state to "not set" with a load error`)
    }
    if (!props.loadError && props.state === ImageStateEnum.FailedToLoad) {
      throw new InvalidImageLoadResultError(`Cannot set state to "failed to load" without a load error`)
    }

    this._image = props.image
    this._state = new ImageState(props.state)
    this._loadError = props.loadError ? new ImageLoadError(props.loadError) : null
  }

  static success(image: Image): ImageLoadResult {
    return new ImageLoadResult({ image, state: ImageStateEnum.Available })
  }

  static failedToLoad(imageId: ImageId, error: Error): ImageLoadResult {
    return new ImageLoadResult({
      image: null,
      state: ImageStateEnum.FailedToLoad,
      loadError: { imageId: imageId.value, error }
    })
  }

  static notSet(): ImageLoadResult {
    return new ImageLoadResult({ image: null, state: ImageStateEnum.NotSet })
  }

  get image(): Image | null {
    return this._image
  }

  get state(): ImageState {
    return this._state
  }

  get loadError(): ImageLoadError | null {
    return this._loadError
  }

  isSuccess(): boolean {
    return this._state.isAvailable()
  }

  isFailed(): boolean {
    return this._state.isFailedToLoad()
  }

  isNotSet(): boolean {
    return this._state.isNotSet()
  }

  getProps(): ImageLoadResultProps {
    return {
      image: this._image,
      state: this._state.value,
      loadError: this._loadError?.getProps() ?? null
    }
  }
}
