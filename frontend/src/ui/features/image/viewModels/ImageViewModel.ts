import { BASE64_PREFIX, EntityTypeEnum, isEnumValue, isNumber, isString } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'

export interface ImageViewModelDTO {
  readonly id: string
  fileName: string
  mimeType: string
  readonly size: number
  ownerEntityId: string
  ownerEntityType: EntityTypeEnum
  base64: string
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number
}

export class ImageViewModel {
  private readonly _id: string
  private _fileName: string
  private _mimeType: string
  private readonly _size: number
  private _ownerEntityId: string
  private _ownerEntityType: EntityTypeEnum
  private _base64: string
  private _createdById: string
  private _createdByName: string
  private _createdAt: number
  private _updatedAt: number

  constructor(props: ImageViewModelDTO) {
    this._id = props.id

    if (!isString(props.fileName)) {
      throw new InvalidViewModelPropertyError(`Property "fileName" must be a string, was '${props.fileName}'`)
    }
    this._fileName = props.fileName

    if (!isString(props.mimeType)) {
      throw new InvalidViewModelPropertyError(`Property "mimeType" must be a string, was '${props.mimeType}'`)
    }
    this._mimeType = props.mimeType

    if (!isNumber(props.size)) {
      throw new InvalidViewModelPropertyError(`Property "size" must be a number, was '${props.size}'`)
    }
    this._size = props.size

    if (!isString(props.ownerEntityId)) {
      throw new InvalidViewModelPropertyError(`Property "ownerEntityId" must be a string, was '${props.ownerEntityId}'`)
    }
    this._ownerEntityId = props.ownerEntityId

    if (!isEnumValue(props.ownerEntityType, EntityTypeEnum)) {
      throw new InvalidViewModelPropertyError(`Property "ownerEntityType" must be one of ${EntityTypeEnum}, was '${props.ownerEntityType}'`)
    }
    this._ownerEntityType = props.ownerEntityType

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

  public get fileName(): string {
    return this._fileName
  }

  public set fileName(fileName: string) {
    if (!isString(fileName)) {
      throw new InvalidViewModelPropertyError(`Property "fileName" must be a string, was '${fileName}'`)
    }
    this._fileName = fileName.replaceAll(' ', '').toLowerCase()
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

  public get ownerEntityId(): string {
    return this._ownerEntityId
  }

  public set ownerEntityId(ownerEntityId: string) {
    if (!isString(ownerEntityId)) {
      throw new InvalidViewModelPropertyError(`Property "ownerEntityId" must be a string, was '${ownerEntityId}'`)
    }
    this._ownerEntityId = ownerEntityId
  }

  public get ownerEntityType(): EntityTypeEnum {
    return this._ownerEntityType
  }

  public set ownerEntityType(ownerEntityType: EntityTypeEnum) {
    if (!isEnumValue(ownerEntityType, EntityTypeEnum)) {
      throw new InvalidViewModelPropertyError(`Property "ownerEntityType" must be one of ${EntityTypeEnum}, was '${ownerEntityType}'`)
    }
    this._ownerEntityType = ownerEntityType
  }

  public get base64(): string {
    return this._base64
  }

  public set base64(base64: string) {
    if (!isString(base64)) {
      throw new InvalidViewModelPropertyError(`Property "base64" must be a string, was '${base64}'`)
    }
    if (base64.startsWith(BASE64_PREFIX)) {
      this._base64 = base64
    } else {
      this._base64 = `${BASE64_PREFIX},${base64}`
    }
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
      fileName: this._fileName,
      mimeType: this._mimeType,
      size: this._size,
      ownerEntityId: this._ownerEntityId,
      ownerEntityType: this._ownerEntityType,
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
      this.fileName === other.fileName &&
      this.mimeType === other.mimeType &&
      this.size === other.size &&
      this.ownerEntityId === other.ownerEntityId &&
      this.ownerEntityType === other.ownerEntityType &&
      this.base64 === other.base64 &&
      this.createdById === other.createdById &&
      this.createdByName === other.createdByName &&
      this.createdAt === other.createdAt &&
      this.updatedAt === other.updatedAt
    )
  }
}
