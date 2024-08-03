import { PartialExceptFor } from '@hatsuportal/common'
import { UpdateImageRequest } from './UpdateImageRequest'

export interface UpdateStoryRequest {
  story: PartialExceptFor<
    {
      id: string
      visibility: string
      imageId: string | null
      name: string
      description: string
    },
    'id'
  >
  image?: UpdateImageRequest
}
