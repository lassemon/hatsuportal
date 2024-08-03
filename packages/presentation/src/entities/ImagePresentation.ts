import { BASE64_PREFIX, PostTypeEnum, isEnumValue, isNumber, isString } from '@hatsuportal/common'
import { PostPresentation, PostPresentationProps } from './PostPresentation'
import { InvalidPresentationPostPropertyError } from '../errors/InvalidPresentationPostPropertyError'

export interface ImagePresentationDTO extends PostPresentationProps {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId: string
  ownerType: PostTypeEnum
  base64: string
}

export class ImagePresentation extends PostPresentation<ImagePresentationDTO> {
  private _fileName: string
  private _mimeType: string
  private readonly _size: number
  private _ownerId: string
  private _ownerType: PostTypeEnum
  private _base64: string

  constructor(props: ImagePresentationDTO) {
    super({ ...props })
    if (!isString(props.fileName)) {
      throw new InvalidPresentationPostPropertyError(`Property "fileName" must be a string, was '${props.fileName}'`)
    }
    this._fileName = props.fileName

    if (!isString(props.mimeType)) {
      throw new InvalidPresentationPostPropertyError(`Property "mimeType" must be a string, was '${props.mimeType}'`)
    }
    this._mimeType = props.mimeType

    if (!isNumber(props.size)) {
      throw new InvalidPresentationPostPropertyError(`Property "size" must be a number, was '${props.size}'`)
    }
    this._size = props.size

    if (!isString(props.ownerId)) {
      throw new InvalidPresentationPostPropertyError(`Property "ownerId" must be a string, was '${props.ownerId}'`)
    }
    this._ownerId = props.ownerId

    if (!isEnumValue(props.ownerType, PostTypeEnum)) {
      throw new InvalidPresentationPostPropertyError(`Property "ownerType" must be one of ${PostTypeEnum}, was '${props.ownerType}'`)
    }
    this._ownerType = props.ownerType

    if (!isString(props.base64)) {
      throw new InvalidPresentationPostPropertyError(`Property "base64" must be a string, was '${props.base64}'`)
    }
    this._base64 = props.base64
  }

  public get fileName(): string {
    return this._fileName
  }

  public set fileName(fileName: string) {
    if (!isString(fileName)) {
      throw new InvalidPresentationPostPropertyError(`Property "fileName" must be a string, was '${fileName}'`)
    }
    this._fileName = fileName.replaceAll(' ', '').toLowerCase()
  }

  public get mimeType(): string {
    return this._mimeType
  }

  public set mimeType(mimeType: string) {
    if (!isString(mimeType)) {
      throw new InvalidPresentationPostPropertyError(`Property "mimeType" must be a string, was '${mimeType}'`)
    }
    this._mimeType = mimeType
  }

  public get size(): number {
    return this._size
  }

  public get ownerId(): string | null {
    return this._ownerId
  }

  public set ownerId(ownerId: string) {
    if (!isString(ownerId)) {
      throw new InvalidPresentationPostPropertyError(`Property "ownerId" must be a string or null, was '${ownerId}'`)
    }
    this._ownerId = ownerId
  }

  public get ownerType(): PostTypeEnum {
    return this._ownerType
  }

  public set ownerType(ownerType: PostTypeEnum) {
    if (!isEnumValue(ownerType, PostTypeEnum)) {
      throw new InvalidPresentationPostPropertyError(`Property "ownerType" must be one of ${PostTypeEnum}, was '${ownerType}'`)
    }
    this._ownerType = ownerType
  }

  public get base64(): string {
    return this._base64
  }

  public set base64(base64: string) {
    if (!isString(base64)) {
      throw new InvalidPresentationPostPropertyError(`Property "base64" must be a string, was '${base64}'`)
    }
    if (base64.startsWith(BASE64_PREFIX)) {
      this._base64 = base64
    } else {
      this._base64 = `${BASE64_PREFIX},${base64}`
    }
  }

  public toJSON(): ImagePresentationDTO {
    return {
      ...this.getBaseProps(),
      fileName: this._fileName,
      mimeType: this._mimeType,
      size: this._size,
      ownerId: this._ownerId ?? null,
      ownerType: this._ownerType ?? null,
      base64: this.base64
    }
  }

  public clone(props?: Partial<ImagePresentationDTO>): ImagePresentation {
    if (props) {
      return new ImagePresentation({ ...this.toJSON(), ...props })
    } else {
      return new ImagePresentation(this.toJSON())
    }
  }

  equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof ImagePresentation &&
      this.fileName === other.fileName &&
      this.mimeType === other.mimeType &&
      this.size === other.size &&
      (this.ownerId ? this.ownerId === other.ownerId : true) &&
      this.ownerType === other.ownerType &&
      this.base64 === other.base64
    )
  }
}
