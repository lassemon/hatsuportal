import { TagResponse } from '@hatsuportal/contracts'
import { TagDTO } from '@hatsuportal/post-management'

export interface ITagApiMapper {
  toResponse(tag: TagDTO): TagResponse
}
