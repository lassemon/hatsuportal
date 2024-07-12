import { ImageDTO } from '@hatsuportal/domain'
import { SynchronousLocalStorageService } from './SynchronousLocalStorageService'
import { SynchronousLocalStorageServiceInterface } from './SynchronousLocalStorageServiceInterface'

export const IMAGE_STATE_NAME = 'imageState'

export class SynchronousLocalStorageImageService implements SynchronousLocalStorageServiceInterface<ImageDTO> {
  constructor(private readonly localStorageRepository: SynchronousLocalStorageService<ImageDTO>) {}

  findById(id: string) {
    const imageJSON = this.localStorageRepository.findById(IMAGE_STATE_NAME)
    if (!imageJSON) {
      throw new Error(`${IMAGE_STATE_NAME} localStorage is empty.`)
    }
    return imageJSON
  }

  store(image: ImageDTO) {
    return this.localStorageRepository.store(image, IMAGE_STATE_NAME)
  }

  delete(id: string) {
    return this.localStorageRepository.delete(id)
  }
}
