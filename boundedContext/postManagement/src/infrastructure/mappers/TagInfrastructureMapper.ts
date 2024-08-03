import { PartialExceptFor } from '@hatsuportal/common'
import { Tag, TagId, TagSlug } from '../../domain'
import { TagDatabaseSchema } from '../schemas/TagDatabaseSchema'
import { TagDTO } from '../../application'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { TagCreatorId } from '../../domain/valueObjects/TagCreatorId'

export interface ITagInfrastructureMapper {
  toDTO(tag: TagDatabaseSchema): TagDTO
  toTagInsertRecord(tag: Tag): TagDatabaseSchema
  toTagUpdateRecord(tag: Tag): PartialExceptFor<TagDatabaseSchema, 'id'>
  toDomainEntity(tag: TagDatabaseSchema): Tag
}

export class TagInfrastructureMapper implements ITagInfrastructureMapper {
  constructor() {}

  toDTO(tag: TagDatabaseSchema): TagDTO {
    return {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      createdById: tag.createdById,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    }
  }

  toTagInsertRecord(tag: Tag): TagDatabaseSchema {
    return {
      id: tag.id.value,
      slug: tag.slug.value,
      name: tag.name.value,
      createdById: tag.createdById.value,
      createdAt: tag.createdAt.value,
      updatedAt: tag.updatedAt.value
    }
  }

  toTagUpdateRecord(tag: Tag): PartialExceptFor<TagDatabaseSchema, 'id'> {
    return {
      id: tag.id.value,
      slug: tag.slug.value,
      name: tag.name.value,
      updatedAt: tag.updatedAt.value
    }
  }

  toDomainEntity(tag: TagDatabaseSchema): Tag {
    return Tag.reconstruct({
      id: new TagId(tag.id),
      slug: new TagSlug(tag.slug),
      name: new NonEmptyString(tag.name),
      createdById: new TagCreatorId(tag.createdById),
      createdAt: new UnixTimestamp(tag.createdAt),
      updatedAt: new UnixTimestamp(tag.updatedAt)
    })
  }
}
