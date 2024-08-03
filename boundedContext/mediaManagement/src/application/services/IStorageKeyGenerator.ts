import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MimeType } from '../../domain'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'

export interface IStorageKeyGenerator {
  generateStorageKey(
    entityType: EntityTypeEnum,
    role: ImageRoleEnum,
    entityId: string,
    versionId: string,
    createdById: string,
    mimeType: MimeType,
    staged: boolean
  ): ImageStorageKey
}
