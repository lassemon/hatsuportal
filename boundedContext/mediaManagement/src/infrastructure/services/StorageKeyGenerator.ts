import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { IStorageKeyGenerator } from '../../application'
import { MimeType } from '../../domain'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'
import { IStorageKeyGeneratorOptions } from '../../application/services/IStorageKeyGenerator'

export class StorageKeyGenerator implements IStorageKeyGenerator {
  generateStorageKey(
    entityType: EntityTypeEnum,
    role: ImageRoleEnum,
    ownerEntityId: string,
    versionId: string,
    createdById: string,
    mimeType: MimeType,
    options: IStorageKeyGeneratorOptions
  ): ImageStorageKey {
    const { isStaged } = options
    return new ImageStorageKey(entityType, role, ownerEntityId, versionId, createdById, mimeType, isStaged)
  }
}
