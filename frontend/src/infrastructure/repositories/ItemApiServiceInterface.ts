import {
  CreateItemResponseDTO,
  FetchOptions,
  ItemResponseDTO,
  MyItemsResponseDTO,
  SearchItemsRequestDTO,
  SearchItemsResponseDTO,
  UpdateItemResponseDTO
} from '@hatsuportal/application'
import { ImageMetadataDTO, Item, ItemDTO } from '@hatsuportal/domain'

export interface ItemListResponse {
  items: Item[]
  totalCount: number
}

export interface ItemApiServiceInterface {
  findAll(options?: FetchOptions): Promise<SearchItemsResponseDTO>
  search(query: SearchItemsRequestDTO, options?: FetchOptions): Promise<SearchItemsResponseDTO>
  myitems(options?: FetchOptions): Promise<MyItemsResponseDTO>
  findById(itemId?: string, options?: FetchOptions): Promise<ItemResponseDTO>
  create(item: ItemDTO, imageMetadata?: ImageMetadataDTO | null, options?: FetchOptions): Promise<CreateItemResponseDTO>
  update(item: ItemDTO, imageMetadata?: ImageMetadataDTO | null, options?: FetchOptions): Promise<UpdateItemResponseDTO>
  delete(itemId: string, options?: FetchOptions): Promise<ItemResponseDTO>
  storeToLocalStorage(item: ItemDTO): Promise<ItemResponseDTO>
}
