import { StoryReadModelDTO } from './StoryReadModelDTO'
import { TagDTO } from '../TagDTO'
import { CommentListChunkDTO } from '../../comment/CommentListChunkDTO'
import { CoverImageWithRelationsDTO } from '../../image/CoverImageWithRelationsDTO'
import { ImageLoadErrorDTO } from '../../image/ImageLoadErrorDTO'
import { ImageStateEnum } from '@hatsuportal/common'

export interface StoryWithRelationsDTO extends Omit<StoryReadModelDTO, 'coverImageId' | 'tagIds' | 'commentIds'> {
  readonly coverImage: CoverImageWithRelationsDTO | null
  readonly imageLoadState: ImageStateEnum
  readonly imageLoadError?: ImageLoadErrorDTO | null
  readonly tags: TagDTO[]
  readonly commentListChunk: CommentListChunkDTO
}
