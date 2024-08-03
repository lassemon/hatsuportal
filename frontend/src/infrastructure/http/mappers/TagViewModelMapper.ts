import { ITagViewModelMapper } from 'application/interfaces'
import { TagResponse } from '@hatsuportal/contracts'
import { TagViewModel } from 'ui/features/post/tag/viewModel/TagViewModel'

export class TagViewModelMapper implements ITagViewModelMapper {
  public toViewModel(response: TagResponse): TagViewModel {
    return new TagViewModel({
      id: response.id,
      name: response.name,
      slug: response.slug,
      createdById: response.createdById,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    })
  }
}
