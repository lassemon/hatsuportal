import { CreateImageRequest } from './CreateImageRequest'

export interface CreateStoryRequest {
  story: {
    visibility: string
    imageId: string | null
    name: string
    description: string
  }
  image?: CreateImageRequest
}
