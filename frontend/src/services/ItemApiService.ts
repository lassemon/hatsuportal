import { LocalStorageItemService } from 'services/LocalStorageItemService'
import { ItemApiServiceInterface } from '../infrastructure/repositories/ItemApiServiceInterface'
import { ImageDTO, Item, ItemDTO } from '@hatsuportal/domain'
import { jsonToQueryString } from '@hatsuportal/infrastructure'
import { defaultItem } from 'defaults'
import { LocalStorageService } from './LocalStorageService'
import { deleteJson, getJson, postJson, putJson } from 'infrastructure/dataAccess/http/fetch'
import _ from 'lodash'
import {
  CreateItemResponseDTO,
  FetchOptions,
  ItemResponseDTO,
  MyItemsResponseDTO,
  SearchItemsRequestDTO,
  SearchItemsResponseDTO,
  UpdateItemResponseDTO
} from '@hatsuportal/application'

const localStorageRepository = new LocalStorageService<ItemDTO>()

class ItemApiService implements ItemApiServiceInterface {
  private localStorageItemService = new LocalStorageItemService(localStorageRepository)

  async findAll(options: FetchOptions = {}): Promise<SearchItemsResponseDTO> {
    return await getJson<SearchItemsResponseDTO>({ ...{ endpoint: `/items` }, ...options })
  }

  async myitems(options: FetchOptions = {}): Promise<MyItemsResponseDTO> {
    return await getJson<ItemDTO[]>({ ...{ endpoint: `/myitems` }, ...options })
  }

  async search(query: SearchItemsRequestDTO, options: FetchOptions = {}): Promise<SearchItemsResponseDTO> {
    const { search, visibility, itemsPerPage = 50, ...mandatoryParams } = query
    const cleanedUpQuery = {
      ...mandatoryParams,
      itemsPerPage,
      ...(!_.isEmpty(search) ? { search } : {}),
      ...(!_.isEmpty(visibility) ? { visibility } : {})
    }
    return await getJson<SearchItemsResponseDTO>({ ...{ endpoint: jsonToQueryString('/items', cleanedUpQuery) }, ...options })
  }

  async findById(id: string): Promise<ItemResponseDTO> {
    try {
      // Attempt to fetch from the backend first
      const itemResponse = await getJson<ItemResponseDTO>({ ...{ endpoint: `/item/${id ? id : ''}` } })
      const item = new Item(itemResponse)
      let localStorageItemDTO = {} as Item
      try {
        localStorageItemDTO = new Item(await this.localStorageItemService.findById())
      } catch (error) {
        // if localstorage is empty and backend item exists, we want to save item from backend to localstorage
        await this.localStorageItemService.store(item.serialize())
      }

      if (item.isEqual(localStorageItemDTO)) {
        return item.serialize()
      }

      const backendDataIsNewer = (item.updatedAt || item.createdAt) > (localStorageItemDTO?.updatedAt || localStorageItemDTO?.createdAt)
      if (backendDataIsNewer) {
        // Update localStorage with the latest item
        await this.localStorageItemService.store(item.serialize())
      }

      return item.serialize()
    } catch (error) {
      // If the backend fetch fails, attempt to retrieve from localStorage
      console.error(error)
      try {
        return await this.localStorageItemService.findById()
      } catch (error) {
        console.error(error)
        return defaultItem
      }
    }
  }

  async create(item: Item, image?: ImageDTO | null): Promise<CreateItemResponseDTO> {
    const createItemResponse = await postJson<CreateItemResponseDTO>({ ...{ endpoint: '/item', payload: { item, image } } })
    await this.localStorageItemService.store(createItemResponse.item)
    return createItemResponse
  }

  async update(item: Item, image?: ImageDTO | null): Promise<UpdateItemResponseDTO> {
    const updateItemResponse = await putJson<UpdateItemResponseDTO>({ ...{ endpoint: '/item', payload: { item, image } } })
    await this.localStorageItemService.store(updateItemResponse.item)
    return updateItemResponse
  }

  async storeToLocalStorage(item: ItemDTO) {
    await this.localStorageItemService.store(item)
    return item
  }

  async delete(itemId: string) {
    await this.localStorageItemService.delete(itemId)
    return await deleteJson<ItemDTO>({ ...{ endpoint: `/item/${itemId}` } })
  }
}

export default ItemApiService
