import { Item, ItemDatabaseEntity, ItemRepositoryInterface, ItemSortableKey, Order, UnknownError, Visibility } from '@hatsuportal/domain'
import { Logger } from '@hatsuportal/common'
import { Knex } from 'knex'
import { ItemSortFields } from '@hatsuportal/domain'
import {
  CountItemsQueryDTO,
  InsertItemQueryDTO,
  ItemMapperInterface,
  SearchItemsQueryDTO,
  UpdateItemQueryDTO
} from '@hatsuportal/application'
import connection from '../common/database/connection'

const logger = new Logger('ItemRepository')

const withAccess =
  (userId?: string, visibility?: `${Visibility}`[], onlyMyItems: boolean = false) =>
  (queryBuilder: Knex.QueryBuilder) => {
    const visibilityFilterIsSet = visibility?.length && visibility?.length > 0
    // double equals (==) to cover for both null and undefined
    if (userId == null) {
      queryBuilder.where({ 'items.visibility': 'public' }) // only public items
    } else {
      if (onlyMyItems === true) {
        queryBuilder.where({ 'items.createdBy': userId }) // only items created by the user
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('items.visibility', visibility)
        }
      } else {
        if (visibilityFilterIsSet) {
          queryBuilder.whereIn('items.visibility', visibility).andWhere((queryBuilder: Knex.QueryBuilder) => {
            queryBuilder.where({ 'items.createdBy': userId }).orWhereNot({ 'items.visibility': 'private' })
          })
        } else {
          // all users own items and all other items except private items of other users
          queryBuilder.andWhere((_queryBuilder) => {
            _queryBuilder.where({ 'items.createdBy': userId }).orWhereNot({ 'items.visibility': 'private' })
          })
        }
      }
    }
  }

const withOrderBy = (orderBy: ItemSortableKey, order: `${Order}`) => (queryBuilder: Knex.QueryBuilder) => {
  if (orderBy) {
    const _orderBy = ItemSortFields.includes(orderBy) ? orderBy : ItemSortableKey.NAME
    const _order = order === Order.Ascending || order === Order.Descending ? order : Order.Descending
    switch (orderBy) {
      case ItemSortableKey.CREATED_BY:
        queryBuilder.orderBy(`createdByUserName`, _order)
        break
      case ItemSortableKey.NAME:
      case ItemSortableKey.VISIBILITY:
        queryBuilder.orderBy(`items.${_orderBy}`, _order)
        break
      default:
        queryBuilder.orderBy(`items.${_orderBy}`, _order)
        break
    }
  }
}

const withHasImage = (hasImage?: boolean | null) => (queryBuilder: Knex.QueryBuilder) => {
  if (hasImage === true || hasImage === false) {
    hasImage ? queryBuilder.whereNot('items.imageId', null) : queryBuilder.where('items.imageId', null)
  }
}

const withWordSearch = (wordSearch?: string) => (queryBuilder: Knex.QueryBuilder) => {
  if (wordSearch) {
    queryBuilder.andWhere(function (_queryBuilder) {
      _queryBuilder.whereILike('items.name', `%${wordSearch}%`)
      _queryBuilder.orWhereILike('items.description', `%${wordSearch}%`)
    })
  }
}

class ItemRepository implements ItemRepositoryInterface<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO> {
  constructor(private readonly itemMapper: ItemMapperInterface) {}

  async findAllPublic(orderBy: ItemSortableKey, order: Order): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<ItemDatabaseEntity>('items')
        .whereIn('visibility', [Visibility.Public])
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(orderBy, order))
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async findLatest(limit: number, loggedIn: boolean): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<any, ItemDatabaseEntity[]>('items')
        .whereIn('visibility', [...(loggedIn ? [Visibility.LoggedIn] : []), Visibility.Public])
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(ItemSortableKey.CREATED_AT, Order.Descending))
        .limit(limit || 5)
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async countAll(userId?: string): Promise<number> {
    const result = await connection('items')
      .whereNotIn('visibility', userId ? [Visibility.Private] : [Visibility.Private, Visibility.LoggedIn])
      .count<{ count: number }>('id as count') // Count the number of item ids
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async count(query: Omit<SearchItemsQueryDTO, 'order' | 'orderBy'>): Promise<number> {
    const result = await connection('items')
      .modify<any, ItemDatabaseEntity[]>(withAccess(query.userId, query.visibility, query.onlyMyItems))
      .modify<any, ItemDatabaseEntity[]>(withHasImage(query.hasImage))
      .modify<any, ItemDatabaseEntity[]>(withWordSearch(query.search))
      .count<{ count: number }>('id as count')
      .first()
    return result ? result.count : 0
  }

  async search(query: SearchItemsQueryDTO): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from('items')
        .modify<any, ItemDatabaseEntity[]>(withAccess(query.userId, query.visibility, query.onlyMyItems))
        .modify<any, ItemDatabaseEntity[]>(withHasImage(query.hasImage))
        .modify<any, ItemDatabaseEntity[]>(withWordSearch(query.search))
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(query.orderBy, query.order))
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async findByImageId(imageId: string): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<any, ItemDatabaseEntity[]>('items')
        .where({ imageId })
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async findAllVisibleForLoggedInUser(userId: string, orderBy: ItemSortableKey, order: Order): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<any, ItemDatabaseEntity[]>('items')
        .whereIn('visibility', [Visibility.Public, Visibility.LoggedIn])
        .orWhere('items.createdBy', userId)
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(orderBy, order))
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async findAllForUser(userId: string): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<any, ItemDatabaseEntity[]>('items')
        .where('items.createdBy', userId)
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(ItemSortableKey.NAME, Order.Ascending))
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async findUserItemsByName(itemName: string, userId: string): Promise<Item[]> {
    return (
      await connection
        .join('users', 'items.createdBy', '=', 'users.id')
        .select('items.*', 'users.name as createdByUserName')
        .from<any, ItemDatabaseEntity[]>('items')
        .where({ createdBy: userId })
        .whereLike('items.name', `${itemName}%`)
        .modify<any, ItemDatabaseEntity[]>(withOrderBy(ItemSortableKey.NAME, Order.Ascending))
    ).map((item) => {
      return this.itemMapper.toItem(item)
    })
  }

  async countItemsCreatedByUser(userId: string): Promise<number> {
    const result = await connection('items')
      .count<{ count: number }>('id as count') // Count the number of item ids
      .where('createdBy', userId) // Apply the condition
      .first() // Use .first() to get the first row of the result
    return result ? result.count : 0
  }

  async findById(itemId: string): Promise<Item | null> {
    const item = await connection
      .join('users', 'items.createdBy', '=', 'users.id')
      .select('items.*', 'users.name as createdByUserName')
      .from<any, ItemDatabaseEntity>('items')
      .where('items.id', itemId)
      .first()
    if (!item) {
      return null
    }

    return this.itemMapper.toItem(item)
  }

  async insert(itemInsert: InsertItemQueryDTO) {
    try {
      await connection<any, ItemDatabaseEntity>('items').insert(itemInsert) // mariadb does not return inserted object
    } catch (error: any) {
      logger.error((error as any)?.message, error.stack ? error.stack : error)
      throw new UnknownError(500, 'UnknownError')
    }
    const insertedItem = await this.findByIdRAW(itemInsert.id)
    if (!insertedItem) {
      throw new UnknownError(404, 'NotFound', 'Item creation failed because just inserted item could not be found from the database.')
    }
    return this.itemMapper.toItem(insertedItem)
  }

  async update(itemUpdate: UpdateItemQueryDTO) {
    try {
      await connection<any, ItemDatabaseEntity>('items').where('id', itemUpdate.id).update(itemUpdate) // mariadb does not return inserted object
    } catch (error: any) {
      logger.error((error as any)?.message, error.stack ? error.stack : error)
      throw new UnknownError(500, 'UnknownError')
    }

    const updatedItem = await this.findByIdRAW(itemUpdate.id)
    if (!updatedItem) {
      throw new UnknownError(404, 'NotFound', 'Item update failed because just updated item could not be found from the database.')
    }
    return this.itemMapper.toItem(updatedItem)
  }

  async delete(itemId: string) {
    try {
      await connection<any, ItemDatabaseEntity>('items').where('id', itemId).delete()
    } catch (error: any) {
      logger.error((error as any)?.message, error.stack ? error.stack : error)
      throw new UnknownError(500, 'UnknownError')
    }
  }

  // RAW in this case means without converting the stringified json data into json
  private async findByIdRAW(itemId: string): Promise<ItemDatabaseEntity | null> {
    const item = await connection
      .join('users', 'items.createdBy', '=', 'users.id')
      .select('items.*', 'users.name as createdByUserName')
      .from<any, ItemDatabaseEntity>('items')
      .where('items.id', itemId)
      .first()
    if (!item) {
      return null
    }

    return item
  }
}

export default ItemRepository
