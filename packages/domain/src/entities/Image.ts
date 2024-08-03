import { BASE64_PREFIX, omitNullAndUndefined, PostTypeEnum, unixtimeNow } from '@hatsuportal/common'
import { Base64Image } from '../valueObjects/Base64Image'
import { Post, PostProps } from './Post'
import { FileName } from '../valueObjects/FileName'
import { MimeType } from '../valueObjects/MimeType'
import { FileSize } from '../valueObjects/FileSize'
import { PostId } from '../valueObjects/PostId'
import { OwnerType } from '../valueObjects/OwnerType'
import { InvalidMimeTypeError } from '../errors/InvalidMimeTypeError'
import mime from 'mime-types'

export interface ImageProps extends PostProps {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId: string
  ownerType: PostTypeEnum
  base64: string
}

export class Image extends Post<ImageProps> {
  static canCreate(props: any) {
    try {
      new Image(props)
      return true
    } catch {
      return false
    }
  }

  protected _fileName: FileName
  protected _mimeType: MimeType
  protected readonly _size: FileSize
  protected _ownerId: PostId
  protected _ownerType: OwnerType
  private _base64: Base64Image

  constructor(props: ImageProps) {
    super({ ...props })
    this._mimeType = new MimeType(props.mimeType)

    const fileExtension = mime.extension(this._mimeType.value)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${props.mimeType}'`)
    }
    this._fileName = new FileName(`${props.fileName.endsWith(fileExtension) ? props.fileName : `${props.fileName}.${fileExtension}`}`)

    this._size = new FileSize(props.size)
    this._ownerId = new PostId(props.ownerId) // TODO, could be also some other type of Id than PostId?
    this._ownerType = new OwnerType(props.ownerType)

    this._base64 = new Base64Image(props.base64?.startsWith(BASE64_PREFIX) ? props.base64 : `${BASE64_PREFIX},${props.base64}`)
  }

  public get fileName(): FileName {
    return this._fileName
  }

  public get storageFileName(): FileName {
    return new FileName(`${this._ownerType.value}_${this._createdBy.value}_${this._fileName.value}`)
  }

  //TODO: This is a temporary function to get the storage file name. Think of a better way to do this.
  public static getStorageFileName(ownerType: string, createdBy: string, fileName: string, mimeType: string): FileName {
    const fileExtension = mime.extension(mimeType)
    if (!fileExtension) {
      throw new InvalidMimeTypeError(`Could not parse mime type from '${mimeType}'`)
    }
    const fileNameWithExtension = `${fileName.endsWith(fileExtension) ? fileName : `${fileName}.${fileExtension}`}`
    return new FileName(`${ownerType}_${createdBy}_${fileNameWithExtension}`)
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

  public get ownerId(): PostId {
    return this._ownerId
  }

  public set ownerId(ownerId: string) {
    this._ownerId = new PostId(ownerId)
  }

  public get ownerType(): OwnerType {
    return this._ownerType
  }

  public set ownerType(ownerType: PostTypeEnum) {
    this._ownerType = new OwnerType(ownerType)
  }

  public get base64(): Base64Image {
    return this._base64
  }

  public set base64(base64: string) {
    if (base64.startsWith(BASE64_PREFIX)) {
      this._base64 = new Base64Image(base64)
    } else {
      this._base64 = new Base64Image(`${BASE64_PREFIX},${base64}`)
    }
  }

  public getProps(): ImageProps {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      fileName: this._fileName.value,
      mimeType: this._mimeType.value,
      size: this._size.value,
      ownerId: this._ownerId.value,
      ownerType: this._ownerType.value,
      base64: this.base64?.value,
      createdBy: this._createdBy.value,
      createdByUserName: this._createdByUserName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  // TODO, should this return a new Image or the instance itself?
  public update(props: Partial<ImageProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Image.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.visibility) this.visibility = sanitizedProps.visibility
      if (sanitizedProps.fileName) this.fileName = sanitizedProps.fileName
      if (sanitizedProps.mimeType) this.mimeType = sanitizedProps.mimeType
      if (sanitizedProps.base64) this.base64 = sanitizedProps.base64
      if (sanitizedProps.ownerId) this.ownerId = sanitizedProps.ownerId
      if (sanitizedProps.ownerType) this.ownerType = sanitizedProps.ownerType
      this.updatedAt = unixtimeNow()
    }
  }

  public delete(): void {
    this.clearEvents()
    //TODO this.addDomainEvent(new ImageDeletedEvent(this))
  }

  equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Image &&
      this.fileName.equals(other.fileName) &&
      this.mimeType.equals(other.mimeType) &&
      this.size.equals(other.size) &&
      (this.ownerId?.equals(other.ownerId) ?? true) &&
      (this.ownerType?.equals(other.ownerType) ?? true) &&
      this.base64.equals(other.base64)
    )
  }
}

export default Image
