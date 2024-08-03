import { EntityTypeEnum, PartialExceptFor, unixtimeNow, validateAndCastEnum } from '@hatsuportal/common'
import { Post } from '../../domain'
import { PostDatabaseSchema } from '../schemas/PostDatabaseSchema'
import { PostDTO } from '../../application'

export interface IPostInfrastructureMapper {
  toDTO(post: PostDatabaseSchema): PostDTO
  toPostInsertRecord(post: Post, postType: EntityTypeEnum): PostDatabaseSchema
  toPostUpdateRecord(post: Post, postType: EntityTypeEnum): PartialExceptFor<PostDatabaseSchema, 'id'>
}

export class PostInfrastructureMapper implements IPostInfrastructureMapper {
  constructor() {}

  toDTO(post: PostDatabaseSchema): PostDTO {
    return {
      id: post.id,
      postType: validateAndCastEnum(post.postType, EntityTypeEnum),
      createdById: post.createdById,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
  }

  toPostInsertRecord(post: Post, postType: EntityTypeEnum): PostDatabaseSchema {
    const createdAt = unixtimeNow()
    return {
      id: post.id.value,
      postType: postType,
      createdById: post.createdById.value,
      createdAt: createdAt,
      updatedAt: createdAt
    }
  }

  toPostUpdateRecord(post: Post, postType: EntityTypeEnum): PartialExceptFor<PostDatabaseSchema, 'id'> {
    const updatedAt = unixtimeNow()
    return {
      id: post.id.value,
      postType: postType,
      updatedAt: updatedAt
    }
  }
}
