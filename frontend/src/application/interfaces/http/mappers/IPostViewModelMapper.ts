import { PostWithRelationsResponse } from '@hatsuportal/contracts'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'

export interface IPostViewModelMapper {
  toViewModel(response: PostWithRelationsResponse): PostViewModel<PostViewModelDTO>
}
