import { ImageStateEnum } from '@hatsuportal/common'
import { CoverImageWithRelationsDTO } from '../image/CoverImageWithRelationsDTO'
import { TagDTO } from './TagDTO'
import { PostReadModelDTO } from './PostReadModelDTO'
import { EntityLoadErrorDTO } from '@hatsuportal/platform'

export interface PostWithRelationsDTO extends Omit<PostReadModelDTO, 'coverImageId' | 'tagIds'> {
  readonly coverImage: CoverImageWithRelationsDTO | null
  readonly imageLoadState: ImageStateEnum
  readonly imageLoadError?: EntityLoadErrorDTO | null
  readonly tags: TagDTO[]
}
