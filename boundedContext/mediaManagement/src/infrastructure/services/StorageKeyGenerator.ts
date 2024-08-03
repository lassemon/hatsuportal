import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IStorageKeyGenerator } from '../../application'
import { MimeType } from '../../domain'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'

export class StorageKeyGenerator implements IStorageKeyGenerator {
  generateStorageKey(
    entityType: EntityTypeEnum,
    role: ImageRoleEnum,
    ownerEntityId: string,
    versionId: string,
    createdById: string,
    mimeType: MimeType,
    staged: boolean
  ): ImageStorageKey {
    return new ImageStorageKey(entityType, role, ownerEntityId, versionId, createdById, mimeType, staged)
  }
}
