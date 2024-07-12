import { FetchOptions, ImageResponseDTO } from '@hatsuportal/application'
import { Image } from '@hatsuportal/domain'
import { deleteJson, getJson, postJson } from 'infrastructure/dataAccess/http/fetch'
import { ImageApiServiceInterface } from './ImageApiServiceInterface'

class ImageApiService implements ImageApiServiceInterface {
  async findById(imageId: string, options?: FetchOptions): Promise<ImageResponseDTO> {
    return await getJson<ImageResponseDTO>({ ...{ endpoint: `/image/${imageId ? imageId : ''}` }, ...options })
    //return new Image(imageResponse)
  }

  // TODO: differentiate between post and put on images?
  // it might not be sensible if images metadata in database is always replaced with a new id
  // when stored to the filesysem.
  // aka are images always created and never updated?
  async create(image: Image, options?: FetchOptions): Promise<ImageResponseDTO> {
    return await postJson<ImageResponseDTO>({ ...{ endpoint: '/image', payload: image }, ...options })
    //return new Image(imageResponse)
  }

  async delete(imageId: string, options?: FetchOptions): Promise<Image> {
    return await deleteJson({ ...{ endpoint: `/image/${imageId ? imageId : ''}` }, ...options })
  }
}

export default ImageApiService
