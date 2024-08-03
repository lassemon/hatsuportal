import { BASE64_PREFIX, EntityTypeEnum, Logger, omitNullAndUndefined, unixtimeNow } from '@hatsuportal/common'
import mime from 'mime-types'
import { ImageId } from '../valueObjects/ImageId'
import { UniqueId } from '../valueObjects/UniqueId'
import { EntityType } from '../valueObjects/EntityType'
import { ImageCreatorId } from '../valueObjects/ImageCreatorId'
import { ImageCreatorName } from '../valueObjects/ImageCreatorName'
import { FileName } from '../valueObjects/FileName'
import { MimeType } from '../valueObjects/MimeType'
import { FileSize } from '../valueObjects/FileSize'
import { Base64Image } from '../valueObjects/Base64Image'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

const logger = new Logger('Image')

export interface ImageProps {
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

export class Image {
  static canCreate(props: any) {
    try {
      new Image(props)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  private _id: ImageId
  private _fileName: FileName
  private _mimeType: MimeType
  private readonly _size: FileSize
  private _ownerEntityId: UniqueId
  private _ownerEntityType: EntityType
  private _base64: Base64Image
  private _createdById: ImageCreatorId
  private _createdByName: ImageCreatorName
  private _createdAt: UnixTimestamp
  private _updatedAt: UnixTimestamp

  constructor(props: ImageProps) {
    this._id = new ImageId(props.id)
    this._createdById = new ImageCreatorId(props.createdById)
    this._createdByName = new ImageCreatorName(props.createdByName)
    this._createdAt = new UnixTimestamp(props.createdAt)
    this._updatedAt = new UnixTimestamp(props.updatedAt)

    this._mimeType = new MimeType(props.mimeType)

    const fileExtension = mime.extension(this._mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${props.mimeType}'`)
    }
    this._fileName = new FileName(`${props.fileName.endsWith(fileExtension) ? props.fileName : `${props.fileName}.${fileExtension}`}`)

    this._size = new FileSize(props.size)
    this._ownerEntityId = new UniqueId(props.ownerEntityId)
    this._ownerEntityType = new EntityType(props.ownerEntityType)

    this._base64 = new Base64Image(props.base64?.startsWith(BASE64_PREFIX) ? props.base64 : `${BASE64_PREFIX},${props.base64}`)
  }

  get id(): ImageId {
    return this._id
  }

  get createdById(): ImageCreatorId {
    return this._createdById
  }

  get createdByName(): ImageCreatorName {
    return this._createdByName
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }

  get fileName(): FileName {
    return this._fileName
  }

  get storageFileName(): FileName {
    return new FileName(`${this._ownerEntityType.value}_${this._ownerEntityId.value}_${this._createdById.value}_${this._fileName.value}`)
  }
  //TODO: This is a temporary function to get the storage file name. Think of a better way to do this.
  public static getStorageFileName(
    ownerType: string,
    ownerEntityId: string,
    createdById: string,
    fileName: string,
    mimeType: string
  ): FileName {
    const fileExtension = mime.extension(mimeType)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${mimeType}'`)
    }
    const fileNameWithExtension = `${fileName.endsWith(fileExtension) ? fileName : `${fileName}.${fileExtension}`}`
    return new FileName(`${ownerType}_${ownerEntityId}_${createdById}_${fileNameWithExtension}`)
  }

  get mimeType(): MimeType {
    return this._mimeType
  }

  get size(): FileSize {
    return this._size
  }

  get ownerEntityId(): UniqueId {
    return this._ownerEntityId
  }

  get ownerEntityType(): EntityType {
    return this._ownerEntityType
  }

  get base64(): Base64Image {
    return this._base64
  }

  set fileName(fileName: string) {
    const fileExtension = mime.extension(this._mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${this._mimeType.value}'`)
    }
    this._fileName = new FileName(`${fileName.endsWith(fileExtension) ? fileName : `${fileName}.${fileExtension}`}`)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  set mimeType(mimeType: string) {
    this._mimeType = new MimeType(mimeType)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  set ownerEntityId(ownerEntityId: string) {
    this._ownerEntityId = new UniqueId(ownerEntityId)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  set ownerEntityType(ownerEntityType: EntityTypeEnum) {
    this._ownerEntityType = new EntityType(ownerEntityType)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  // TODO, remove setters and use generic update function instead
  set base64(base64: string) {
    if (base64.startsWith(BASE64_PREFIX)) {
      this._base64 = new Base64Image(base64)
    } else {
      this._base64 = new Base64Image(`${BASE64_PREFIX},${base64}`)
    }
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public update(props: Partial<ImageProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Image.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.fileName) this.fileName = sanitizedProps.fileName
      if (sanitizedProps.mimeType) this.mimeType = sanitizedProps.mimeType
      if (sanitizedProps.base64) this.base64 = sanitizedProps.base64
      if (sanitizedProps.ownerEntityId) this.ownerEntityId = sanitizedProps.ownerEntityId
      if (sanitizedProps.ownerEntityType) this.ownerEntityType = sanitizedProps.ownerEntityType
      this._updatedAt = new UnixTimestamp(unixtimeNow())
    }
  }

  public getProps(): ImageProps {
    return {
      id: this._id.value,
      fileName: this._fileName.value,
      mimeType: this._mimeType.value,
      size: this._size.value,
      base64: this.base64?.value,
      createdById: this._createdById.value,
      createdByName: this._createdByName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value,
      ownerEntityId: this._ownerEntityId.value,
      ownerEntityType: this._ownerEntityType.value
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof Image &&
      this.id.equals(other.id) &&
      this.fileName.equals(other.fileName) &&
      this.mimeType.equals(other.mimeType) &&
      this.size.equals(other.size) &&
      this.base64.equals(other.base64) &&
      this.createdById.equals(other.createdById) &&
      this.createdByName.equals(other.createdByName) &&
      this.createdAt.equals(other.createdAt) &&
      this.updatedAt.equals(other.updatedAt)
    )
  }
}

export default Image
