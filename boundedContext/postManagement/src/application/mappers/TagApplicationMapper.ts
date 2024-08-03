import { Tag } from '../../domain'
import { TagDTO } from '../dtos'

export interface ITagApplicationMapper {
  toDTO(tag: Tag): TagDTO
}

export class TagApplicationMapper implements ITagApplicationMapper {
  toDTO(tag: Tag): TagDTO {
    return {
      id: tag.id.value,
      slug: tag.slug.value,
      name: tag.name.value,
      createdById: tag.createdById.value,
      createdAt: tag.createdAt.value,
      updatedAt: tag.updatedAt.value
    }
  }
}
