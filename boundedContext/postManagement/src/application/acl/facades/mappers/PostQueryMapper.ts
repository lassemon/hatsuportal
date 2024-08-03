import { mediaV1, postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { StoryWithRelationsDTO } from '../../../dtos'

export interface IPostQueryMapper {
  toStoryContract(story: StoryWithRelationsDTO): postV1.StoryContract
}

export class PostQueryMapper implements IPostQueryMapper {
  public toStoryContract(story: StoryWithRelationsDTO): postV1.StoryContract {
    return {
      id: story.id.toString(),
      createdById: story.createdById.toString(),
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      visibility: story.visibility,
      title: story.title,
      body: story.body,
      createdByName: story.createdByName,
      coverImage: story.coverImage
        ? {
            id: story.coverImage.id.toString(),
            kind: mediaV1.MediaKindContract.Image,
            storageKey: story.coverImage.storageKey.toString(),
            mimeType: story.coverImage.mimeType.toString(),
            size: story.coverImage.size,
            base64: story.coverImage.base64.toString(),
            createdById: story.coverImage.createdById.toString(),
            createdAt: story.coverImage.createdAt,
            updatedAt: story.coverImage.updatedAt
          }
        : null,
      tags: story.tags.map((tag) => ({
        id: tag.id.toString(),
        name: tag.name,
        slug: tag.slug,
        createdById: tag.createdById.toString(),
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
      }))
    }
  }
}
