import { ItemDTO } from '@hatsuportal/domain'
import { SynchronousLocalStorageServiceInterface } from './SynchronousLocalStorageServiceInterface'
import { SynchronousLocalStorageService } from './SynchronousLocalStorageService'

export const ITEM_STATE_NAME = 'itemState'

export class SynchronousLocalStorageItemService implements SynchronousLocalStorageServiceInterface<ItemDTO> {
  constructor(private readonly localStorageRepository: SynchronousLocalStorageService<ItemDTO>) {}

  findById(id: string) {
    const itemJSON = this.localStorageRepository.findById(ITEM_STATE_NAME)
    if (!itemJSON) {
      throw new Error(`${ITEM_STATE_NAME} localStorage is empty.`)
    }
    return itemJSON
  }

  store(item: ItemDTO) {
    this.localStorageRepository.store(item, ITEM_STATE_NAME)
    return this.findById(item.id)
  }

  delete(itemId: string) {
    return this.localStorageRepository.delete(ITEM_STATE_NAME)
  }
}
