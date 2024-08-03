import { EntityBaseDTO } from '@hatsuportal/shared-kernel'

/**
 * Difference from ImageDTO is that it does not have a base64 property,
 * this is what ImageMetadataRepository returns
 */
export interface ImageMetadataDTO extends EntityBaseDTO {
  readonly storageKey: string
  mimeType: string
  readonly size: number
  readonly currentVersionId: string
  isCurrent: boolean
  isStaged: boolean
  readonly createdById: string
}
