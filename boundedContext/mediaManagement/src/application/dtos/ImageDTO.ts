import { EntityBaseDTO } from '@hatsuportal/shared-kernel'

export interface ImageDTO extends EntityBaseDTO {
  readonly storageKey: string
  mimeType: string
  readonly size: number
  base64: string
  readonly currentVersionId: string
  isCurrent: boolean
  isStaged: boolean
  readonly createdById: string
}
