import { PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'
import { TagInputDTO } from './TagInputDTO'

export type UpdateStoryImageInputDTO = Partial<{
  mimeType?: string
  size: number
  base64: string
}>

export type UpdateStoryInputDTO = PartialExceptFor<
  {
    id: string
    visibility: VisibilityEnum
    image: UpdateStoryImageInputDTO | null
    name: string
    description: string
    tags: TagInputDTO[]
  },
  'id'
>
