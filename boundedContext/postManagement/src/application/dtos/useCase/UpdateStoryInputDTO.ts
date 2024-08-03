import { PartialExceptFor, VisibilityEnum } from '@hatsuportal/common'

export type UpdateStoryImageInputDTO = Partial<{
  mimeType?: string
  size: number
  base64: string
}>

export type TagInputDTO =
  | { id: string } // existing
  | { name: string } // to‑be‑created

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
