import { ImageStateEnum } from '@hatsuportal/common'
import { CoverImageWithRelationsDTO } from '../image/CoverImageWithRelationsDTO'
import { ImageLoadErrorDTO } from '../image/ImageLoadErrorDTO'
import { TagDTO } from './TagDTO'
import { PostReadModelDTO } from './PostReadModelDTO'

export interface PostWithRelationsDTO extends Omit<PostReadModelDTO, 'coverImageId' | 'tagIds'> {
  readonly coverImage: CoverImageWithRelationsDTO | null
  readonly imageLoadState: ImageStateEnum
  readonly imageLoadError?: ImageLoadErrorDTO | null
  readonly tags: TagDTO[]
}
