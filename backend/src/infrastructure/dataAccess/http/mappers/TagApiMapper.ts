import { TagDTO } from '@hatsuportal/post-management'
import { TagResponse } from '@hatsuportal/contracts'
import { ITagApiMapper } from '../../../../application/dataAccess'

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
