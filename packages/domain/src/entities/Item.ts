import { EntityDTO } from './AbstractEntity'
import { Entity } from './Entity'

export interface ItemDatabaseEntity extends EntityDTO {
  imageId: string | null
  name: string
  description: string
}

export interface ItemDTO extends ItemDatabaseEntity {}

export enum ItemSortableKey {
  NAME = 'name',
  VISIBILITY = 'visibility',
  CREATED_BY = 'createdBy',
  SOURCE = 'source',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export const ItemSortFields: ItemSortableKey[] = [
  ItemSortableKey.NAME,
  ItemSortableKey.VISIBILITY,
  ItemSortableKey.CREATED_BY,
  ItemSortableKey.SOURCE,
  ItemSortableKey.CREATED_AT,
  ItemSortableKey.UPDATED_AT
]

export class Item extends Entity<ItemDTO> {
  constructor(props: ItemDTO) {
    super({ ...props })
    this
  }

  protected getAllowedKeys(): (keyof ItemDTO)[] {
    return [
      'id',
      'visibility',
      'createdBy',
      'createdByUserName',
      'createdAt',
      'updatedAt',
      'imageId',
      'name',
      'description'
    ] as (keyof ItemDTO)[]
  }

  public get name(): string {
    return this.props.name
  }

  public get imageId(): string | null {
    return this.props.imageId
  }

  public set imageId(imageId: string | null) {
    this.props.imageId = imageId
  }

  public get description(): string {
    return this.props.description
  }

  public getCreatedByUserName(userId?: string) {
    if (userId && this.props.createdByUserName && userId === this.props.createdBy) {
      return `${this.props.createdByUserName} (You)`
    }
    return this.props.createdByUserName || ''
  }
}

export default Item
