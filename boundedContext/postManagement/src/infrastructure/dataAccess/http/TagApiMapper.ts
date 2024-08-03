import { ITagApiMapper } from '../../../application/dataAccess/http/ITagApiMapper'
import { TagDTO } from '../../../application/dtos/post/TagDTO'
import { TagResponse } from '@hatsuportal/contracts'

export class TagApiMapper implements ITagApiMapper {
  toResponse(tag: TagDTO): TagResponse {
    return {
      id: tag.id,
      slug: tag.slug,
      name: tag.name,
      createdById: tag.createdById,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    }
  }
}
