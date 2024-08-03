import { Post, PostProps } from './Post'

import { FileName } from '../valueObjects/FileName'
import { MimeType } from '../valueObjects/MimeType'
import { PostId } from '../valueObjects/PostId'
import { OwnerType } from '../valueObjects/OwnerType'
import { FileSize } from '../valueObjects/FileSize'
import { PostTypeEnum, isEnumValue, omitNullAndUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import mime from 'mime-types'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'

export interface ImageMetadataProps extends PostProps {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId: string | null
  ownerType: PostTypeEnum
}

export class ImageMetadata<T extends ImageMetadataProps = ImageMetadataProps> extends Post<T> {
  static canCreate(props: any) {
    try {
      new ImageMetadata(props)
      return true
    } catch {
      return false
    }
  }

  protected _fileName: FileName
  protected _mimeType: MimeType
  protected readonly _size: FileSize
  protected _ownerId: PostId | null
  protected _ownerType: OwnerType

  constructor(props: T) {
    super({ ...props })

    this._mimeType = new MimeType(props.mimeType)

    const fileExtension = mime.extension(this._mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${props.mimeType}'`)
    }
    this._fileName = new FileName(`${props.fileName.endsWith(fileExtension) ? props.fileName : `${props.fileName}.${fileExtension}`}`)

    this._size = new FileSize(props.size)
    this._ownerId = props.ownerId ? new PostId(props.ownerId) : null
    this._ownerType = new OwnerType(props.ownerType)
  }

  public get fileName(): FileName {
    return this._fileName
  }

  public get storageFileName(): FileName {
    return new FileName(`${this._ownerType.value}_${this._createdBy.value}_${this._fileName.value}`)
  }

  public set fileName(fileName: string) {
    const fileExtension = mime.extension(this._mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${this._mimeType.value}'`)
    }
    this._fileName = new FileName(`${fileName.endsWith(fileExtension) ? fileName : `${fileName}.${fileExtension}`}`)
  }

  public get mimeType(): MimeType {
    return this._mimeType
  }

  public set mimeType(mimeType: string) {
    this._mimeType = new MimeType(mimeType)
  }

  public get size(): FileSize {
    return this._size
  }

  public get ownerId(): PostId | null {
    return this._ownerId
  }

  public set ownerId(ownerId: string | null) {
    this._ownerId = ownerId ? new PostId(ownerId) : null
  }

  public get ownerType(): OwnerType {
    return this._ownerType
  }

  public set ownerType(ownerType: PostTypeEnum) {
    this._ownerType = new OwnerType(ownerType)
  }

  public getProps(): ImageMetadataProps {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      fileName: this._fileName.value,
      mimeType: this._mimeType.value,
      size: this._size.value,
      ownerId: this._ownerId?.value ?? null,
      ownerType: this._ownerType.value,
      createdBy: this._createdBy.value,
      createdByUserName: this._createdByUserName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  public update(props: Partial<ImageMetadataProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (ImageMetadata.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) this.visibility = sanitizedProps.visibility
      if (sanitizedProps.fileName) this.fileName = sanitizedProps.fileName
      if (sanitizedProps.mimeType) this.mimeType = sanitizedProps.mimeType
      this.ownerId = sanitizedProps.ownerId ?? null
      if (sanitizedProps.ownerType) this.ownerType = sanitizedProps.ownerType
      this.updatedAt = unixtimeNow()
    }
  }

  equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof ImageMetadata &&
      this.fileName.equals(other.fileName) &&
      this.mimeType.equals(other.mimeType) &&
      this.size.equals(other.size) &&
      (this.ownerId?.equals(other.ownerId) ?? true) &&
      (this.ownerType?.equals(other.ownerType) ?? true)
    )
  }
}

export default ImageMetadata
