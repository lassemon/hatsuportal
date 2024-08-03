import { TagResponse } from '@hatsuportal/contracts'
import { TagViewModel } from 'ui/features/post/tag/viewModel/TagViewModel'

export interface ITagViewModelMapper {
  toViewModel(response: TagResponse): TagViewModel
}
