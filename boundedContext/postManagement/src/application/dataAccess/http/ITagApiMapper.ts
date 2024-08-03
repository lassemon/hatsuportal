import { TagDTO } from '../../dtos/post/TagDTO'
import { TagResponse } from '@hatsuportal/contracts'

export interface ITagApiMapper {
  toResponse(tag: TagDTO): TagResponse
}
