import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { MimeType } from '../../domain'
import { ImageStorageKey } from '../../domain/valueObjects/ImageStorageKey'

export interface IStorageKeyGeneratorOptions {
  isStaged: boolean
}
export interface IStorageKeyGenerator {
  generateStorageKey(
    entityType: EntityTypeEnum,
    role: ImageRoleEnum,
    entityId: string,
    versionId: string,
    createdById: string,
    mimeType: MimeType,
    options: IStorageKeyGeneratorOptions
  ): ImageStorageKey
}
