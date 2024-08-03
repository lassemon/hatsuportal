import { PostWithRelationsResponse, SearchPostsRequest } from '@hatsuportal/contracts'
import { PostSearchCriteriaDTO, PostWithRelationsDTO } from '../../dtos'

export interface IPostApiMapper {
  toPostSearchCriteriaDTO(searchPostsRequest: SearchPostsRequest): PostSearchCriteriaDTO
  toPostWithRelationsResponse(dto: PostWithRelationsDTO): PostWithRelationsResponse
}
