import { ImageDTO, ImageLoadErrorDTO } from '@hatsuportal/common-bounded-context'
import { PostDTO } from './PostDTO'
import { ImageStateEnum } from '@hatsuportal/common'

export interface StoryDTO extends PostDTO {
  image: ImageDTO | null
  name: string
  description: string
  imageLoadState: ImageStateEnum
  imageLoadError?: ImageLoadErrorDTO | null
}
