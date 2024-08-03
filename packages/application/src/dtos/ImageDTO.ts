import { PostTypeEnum } from '@hatsuportal/common'
import { PostDTO } from './PostDTO'

export interface ImageDTO extends PostDTO {
  fileName: string
  mimeType: string
  readonly size: number
  ownerId: string
  ownerType: PostTypeEnum
  base64: string
}
