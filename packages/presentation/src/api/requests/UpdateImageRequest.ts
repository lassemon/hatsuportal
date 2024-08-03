import { PartialExceptFor } from '@hatsuportal/common'

export interface UpdateImageRequest
  extends PartialExceptFor<
    {
      id: string
      visibility: string
      fileName: string
      mimeType: string
      size: number
      ownerId: string
      ownerType: string
      base64: string
    },
    'size' | 'base64' | 'id'
  > {}
