import { EntityBaseDTO } from '@hatsuportal/shared-kernel'

/**
 * Difference from ImageDTO is that it does not have a base64 property,
 * this is what ImageMetadataRepository returns
 */
export interface ImageMetadataDTO extends EntityBaseDTO {
  /** Id of the joined image_versions row (the row this DTO describes). */
  readonly versionId: string

  /** Raw images.current_version_id pointer; null when no version is published yet. */
  readonly currentVersionPointer: string | null

  readonly storageKey: string
  mimeType: string
  readonly size: number
  isCurrent: boolean
  isStaged: boolean
  readonly createdById: string
}
