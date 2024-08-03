import { PostTypeEnum } from '@hatsuportal/common'
import { PostDTO } from './PostDTO'

export interface ImageMetadataDTO extends PostDTO {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId: string | null
  ownerType: PostTypeEnum
}
