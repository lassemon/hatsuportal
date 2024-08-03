import { FetchOptions } from '@hatsuportal/contracts'
import { TagViewModel } from 'ui/entities/tag/model/TagViewModel'

export interface ITagService {
  findAll(options?: FetchOptions): Promise<TagViewModel[]>
}
