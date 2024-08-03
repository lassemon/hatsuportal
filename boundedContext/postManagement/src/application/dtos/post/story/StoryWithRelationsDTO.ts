import { StoryReadModelDTO } from './StoryReadModelDTO'
import { TagDTO } from '../TagDTO'
import { CommentListChunkDTO } from '../../comment/CommentListChunkDTO'
import { CoverImageWithRelationsDTO } from '../../image/CoverImageWithRelationsDTO'
import { ImageStateEnum } from '@hatsuportal/common'
import { EntityLoadErrorDTO } from '@hatsuportal/platform'

export interface StoryWithRelationsDTO extends Omit<StoryReadModelDTO, 'coverImageId' | 'tagIds' | 'commentIds'> {
  readonly coverImage: CoverImageWithRelationsDTO | null
  readonly imageLoadState: ImageStateEnum
  readonly imageLoadError?: EntityLoadErrorDTO | null
  readonly tags: TagDTO[]
  readonly commentListChunk: CommentListChunkDTO
}
