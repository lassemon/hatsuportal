import Item from '../entities/Item'
import { Order } from '../enums/Order'

// return Item domain entity here instead of UserDTO
// to adhere to ddd princibles and allow the domain to directly work with a rich model
export interface ItemRepositoryInterface<CountItemsQuery, SearchItemsQuery, InsertItemQuery, UpdateItemQuery> {
  insert(item: InsertItemQuery, userId: string): Promise<Item>
  update(item: UpdateItemQuery): Promise<Item>
  count(query: CountItemsQuery): Promise<number>
  search(query: SearchItemsQuery): Promise<Item[]>

  findAllPublic(orderBy: string, order: `${Order}`): Promise<Item[]>
  findById(id: string): Promise<Item | null>
  findByImageId(imageId: string): Promise<Item[]>
  findAllVisibleForLoggedInUser(userId: string, orderBy: string, order: `${Order}`): Promise<Item[]>
  findAllForUser(userId: string): Promise<Item[]>
  findLatest(limit: number, loggedIn: boolean): Promise<Item[]>
  findUserItemsByName(itemName: string, userId: string): Promise<Item[]>
  countAll(): Promise<number>
  countItemsCreatedByUser(userId: string): Promise<number>

  delete(itemId: string): Promise<void>
}
