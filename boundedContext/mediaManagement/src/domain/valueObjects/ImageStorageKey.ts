import { EntityTypeEnum, ImageRoleEnum, castToEnum } from '@hatsuportal/common'
import { ValueObject } from '@hatsuportal/shared-kernel'
import { MimeType } from './MimeType'

export class ImageStorageKey extends ValueObject<string> {
  public readonly value: string

  static fromString(value: string): ImageStorageKey {
    const stagedPrefix = value.startsWith('staged_') ? true : false
    const valueWithoutStagedPrefix = stagedPrefix ? value.substring(7) : value
    const [beforeExt, fileExtension] = valueWithoutStagedPrefix.split('.', 2)
    // entity-type_role_owner-entity-id_version-id_created-by-id.extension
    const [entityTypeString, roleString, ownerEntityId, versionId, createdById] = beforeExt.split('_')
    const entityType = castToEnum(entityTypeString, EntityTypeEnum, EntityTypeEnum.Unknown)
    const role = castToEnum(roleString, ImageRoleEnum, ImageRoleEnum.Unknown)
    return new ImageStorageKey(
      entityType,
      role,
      ownerEntityId,
      versionId,
      createdById,
      new MimeType(`image/${fileExtension}`),
      stagedPrefix
    )
  }

  constructor(
    public readonly entityType: EntityTypeEnum,
    public readonly role: ImageRoleEnum,
    public readonly ownerEntityId: string,
    public readonly versionId: string,
    public readonly createdById: string,
    public readonly mimeType: MimeType,
    public readonly staged: boolean
  ) {
    super()
    const stagedPrefix = staged ? 'staged_' : ''
    this.value = `${stagedPrefix}${entityType}_${role}_${ownerEntityId}_${versionId}_${createdById}.${mimeType.fileExtension}`
  }

  equals(other: unknown): boolean {
    return other instanceof ImageStorageKey && this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
