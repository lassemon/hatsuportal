import { FetchOptions } from '@hatsuportal/contracts'
import { TagViewModel } from 'ui/features/post/tag/viewModel/TagViewModel'

export interface ITagService {
  findAll(options?: FetchOptions): Promise<TagViewModel[]>
}
