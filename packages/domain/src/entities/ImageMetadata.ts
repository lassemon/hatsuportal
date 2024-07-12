import { Entity } from './Entity'

import { EntityDTO } from './AbstractEntity'
import { EntityType } from '../enums/EntityType'

export interface ImageMetadataDatabaseEntity extends EntityDTO {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId?: string
  ownerType?: `${EntityType}`
}

export interface ImageMetadataDTO extends ImageMetadataDatabaseEntity {}

export class ImageMetadata<T extends ImageMetadataDTO = ImageMetadataDTO> extends Entity<T> {
  constructor(props: T) {
    super({ ...props })
  }

  protected getAllowedKeys(): (keyof T)[] {
    return [
      'id',
      'visibility',
      'createdBy',
      'createdByUserName',
      'createdAt',
      'updatedAt',
      'fileName',
      'mimeType',
      'size',
      'ownerId',
      'ownerType'
    ] as (keyof T)[]
  }

  public get fileName(): string {
    return this.props.fileName
  }

  public set fileName(value: string) {
    this.props.fileName = value.replaceAll(' ', '').toLowerCase()
  }

  public get mimeType(): string {
    return this.props.mimeType
  }

  public set mimeType(mimeType: string) {
    this.props.mimeType = mimeType
  }

  public get size(): number {
    return this.props.size
  }

  public get ownerId(): string | undefined {
    return this.props.ownerId
  }

  public get ownerType(): `${EntityType}` | undefined {
    return this.props.ownerType
  }
}

export default ImageMetadata
