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
import { IDomainEvent } from '../events/IDomainEvent'
import { ImageCreatedEvent, ImageDeletedEvent, ImageUpdatedEvent } from '../events/image/ImageEvents'
import { IDomainEventHolder } from '../events/IDomainEventHolder'
import { Entity, EntityProps } from './Entity'

const logger = new Logger('Image')

export interface ImageProps extends EntityProps {
  fileName: string
  mimeType: string
  readonly size: number
  ownerEntityId: string
  ownerEntityType: EntityTypeEnum
  base64: string
  readonly createdById: string
  readonly createdByName: string
}

interface CanCreateOptions {
  throwError?: boolean
}

export class Image extends Entity<ImageProps> implements IDomainEventHolder {
  static canCreate(props: any, { throwError = false }: CanCreateOptions = {}) {
    try {
      new Image(props)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  static create(props: ImageProps): Image {
    const image = new Image(props)
    image.addDomainEvent(new ImageCreatedEvent(image))
    return image
  }

  static reconstruct(props: ImageProps): Image {
    return new Image(props)
  }

  protected _id: ImageId
  private _fileName: FileName
  private _mimeType: MimeType
  private readonly _size: FileSize
  private _ownerEntityId: UniqueId
  private _ownerEntityType: EntityType
  private _base64: Base64Image
  private _createdById: ImageCreatorId
  private _createdByName: ImageCreatorName

  private _domainEvents: IDomainEvent[] = []

  private constructor(props: ImageProps) {
    super(props)

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

    this._base64 = new Base64Image(props.base64)
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

  /**
   * Use this update function to update any property of the image.
   * This allows encapsulating the domain events as well as the updated at timestamp in the update function.
   *
   * @param props - The properties to update.
   * @throws {InvalidImagePropertyError} If the image is not a valid image.
   */
  public update(props: Partial<ImageProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Image.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.fileName) {
        const fileExtension = mime.extension(this._mimeType.value)
        if (!fileExtension) {
          throw new InvalidMimeTypeError(`Could not parse mime type from '${this._mimeType.value}'`)
        }
        this._fileName = new FileName(
          `${sanitizedProps.fileName.endsWith(fileExtension) ? sanitizedProps.fileName : `${sanitizedProps.fileName}.${fileExtension}`}`
        )
      }
      if (sanitizedProps.mimeType) this._mimeType = new MimeType(sanitizedProps.mimeType)
      if (sanitizedProps.base64) {
        if (sanitizedProps.base64.startsWith(BASE64_PREFIX)) {
          this._base64 = new Base64Image(sanitizedProps.base64)
        } else {
          this._base64 = new Base64Image(`${BASE64_PREFIX},${sanitizedProps.base64}`)
        }
      }
      if (sanitizedProps.ownerEntityId) this._ownerEntityId = new UniqueId(sanitizedProps.ownerEntityId)
      if (sanitizedProps.ownerEntityType) this._ownerEntityType = new EntityType(sanitizedProps.ownerEntityType)
      this._updatedAt = new UnixTimestamp(unixtimeNow())
      this.addDomainEvent(new ImageUpdatedEvent(this))
    }
  }

  // TODO, is it smelly to have both getProps and ApplicationMapper.toDTO ?
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

  public delete(): void {
    this.addDomainEvent(new ImageDeletedEvent(this))
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

  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event)
  }
}

export default Image
