import { FetchOptions } from '@hatsuportal/contracts'
import { ITagHttpClient, ITagService, ITagViewModelMapper } from 'application/interfaces'
import { TagViewModel } from 'ui/features/post/tag/viewModel/TagViewModel'

export class TagService implements ITagService {
  constructor(private readonly tagHttpClient: ITagHttpClient, private readonly tagViewModelMapper: ITagViewModelMapper) {}

  public async findAll(options?: FetchOptions): Promise<TagViewModel[]> {
    const { tags } = await this.tagHttpClient.findAll(options)
    return tags.map((tag) => this.tagViewModelMapper.toViewModel(tag))
  }
}
