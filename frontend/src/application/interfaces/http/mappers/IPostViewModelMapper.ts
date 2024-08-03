import { PostWithRelationsResponse } from '@hatsuportal/contracts'
import { PostViewModel, PostViewModelDTO } from 'ui/features/post/common/viewModels/PostViewModel'

export interface IPostViewModelMapper {
  toViewModel(response: PostWithRelationsResponse): PostViewModel<PostViewModelDTO>
}
