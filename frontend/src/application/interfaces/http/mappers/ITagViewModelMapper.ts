import { TagResponse } from '@hatsuportal/contracts'
import { TagViewModel } from 'ui/entities/tag/model/TagViewModel'

export interface ITagViewModelMapper {
  toViewModel(response: TagResponse): TagViewModel
}
