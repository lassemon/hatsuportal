import { LocalStorageServiceInterface } from '../infrastructure/repositories/LocalStorageServiceInterface'
import { ItemDTO } from '@hatsuportal/domain'

export const ITEM_STATE_NAME = 'itemState'

export class LocalStorageItemService implements LocalStorageServiceInterface<ItemDTO> {
  constructor(private readonly localStorageRepository: LocalStorageServiceInterface<ItemDTO>) {}

  async findById(id?: string) {
    const itemJSON = await this.localStorageRepository.findById(ITEM_STATE_NAME)
    if (!itemJSON) {
      throw new Error(`${ITEM_STATE_NAME} localStorage is empty.`)
    }
    return Promise.resolve(itemJSON) // Wrapping in Promise to conform to the async interface
  }

  async store(item: ItemDTO) {
    return await this.localStorageRepository.store(item, ITEM_STATE_NAME)
  }

  async delete(id: string) {
    return await this.localStorageRepository.delete(id)
  }
}
