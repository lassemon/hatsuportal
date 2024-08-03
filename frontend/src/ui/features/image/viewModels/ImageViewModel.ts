import { isNumber, isString } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'

export interface ImageViewModelDTO {
  readonly id: string
  mimeType: string
  readonly size: number
  base64: string
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number
}

export class ImageViewModel {
  private readonly _id: string
  private _mimeType: string
  private readonly _size: number
  private _base64: string
  private _createdById: string
  private _createdByName: string
  private _createdAt: number
  private _updatedAt: number

  constructor(props: ImageViewModelDTO) {
    this._id = props.id

    if (!isString(props.mimeType)) {
      throw new InvalidViewModelPropertyError(`Property "mimeType" must be a string, was '${props.mimeType}'`)
    }
    this._mimeType = props.mimeType

    if (!isNumber(props.size)) {
      throw new InvalidViewModelPropertyError(`Property "size" must be a number, was '${props.size}'`)
    }
    this._size = props.size

    if (!isString(props.base64)) {
      throw new InvalidViewModelPropertyError(`Property "base64" must be a string, was '${props.base64}'`)
    }
    this._base64 = props.base64

    this._createdById = props.createdById
    this._createdByName = props.createdByName
    this._createdAt = props.createdAt
    if (!isNumber(props.updatedAt) && props.updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number or null, was '${props.updatedAt}'`)
    }
    this._updatedAt = props.updatedAt
  }

  public get id(): string {
    return this._id
  }

  public get mimeType(): string {
    return this._mimeType
  }

  public set mimeType(mimeType: string) {
    if (!isString(mimeType)) {
      throw new InvalidViewModelPropertyError(`Property "mimeType" must be a string, was '${mimeType}'`)
    }
    this._mimeType = mimeType
  }

  public get size(): number {
    return this._size
  }

  public get base64(): string {
    return this._base64
  }

  public set base64(base64: string) {
    if (!isString(base64)) {
      throw new InvalidViewModelPropertyError(`Property "base64" must be a string, was '${base64}'`)
    }
    // FIXME: remove commented code permanently once we know how to handle different mimetype base64 strings
    //if (base64.startsWith(BASE64_PREFIX)) {
    this._base64 = base64
    //} else {
    //  this._base64 = `${BASE64_PREFIX},${base64}`
    //}
  }

  get createdById(): string {
    return this._createdById
  }

  get createdByName(): string {
    return this._createdByName
  }

  get createdAt(): number {
    return this._createdAt
  }

  get updatedAt(): number {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number) {
    if (!isNumber(updatedAt)) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt
  }

  public toJSON(): ImageViewModelDTO {
    return {
      id: this._id,
      mimeType: this._mimeType,
      size: this._size,
      base64: this.base64,
      createdById: this._createdById,
      createdByName: this._createdByName,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }

  public clone(props?: Partial<ImageViewModelDTO>): ImageViewModel {
    if (props) {
      return new ImageViewModel({ ...this.toJSON(), ...props })
    } else {
      return new ImageViewModel(this.toJSON())
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof ImageViewModel &&
      this.id === other.id &&
      this.mimeType === other.mimeType &&
      this.size === other.size &&
      this.base64 === other.base64 &&
      this.createdById === other.createdById &&
      this.createdByName === other.createdByName &&
      this.createdAt === other.createdAt &&
      this.updatedAt === other.updatedAt
    )
  }
}
