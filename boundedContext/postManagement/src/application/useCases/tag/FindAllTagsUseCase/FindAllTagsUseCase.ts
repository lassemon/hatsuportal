import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { TagDTO } from '../../../dtos/post/TagDTO'
import { ITagRepository } from '../../../../domain'
import { ITagApplicationMapper } from '../../../mappers/TagApplicationMapper'

export interface IFindAllTagsUseCaseOptions extends IUseCaseOptions {
  tagsFound: (tags: TagDTO[]) => void
}

export type IFindAllTagsUseCase = IUseCase<IFindAllTagsUseCaseOptions>

export class FindAllTagsUseCase implements IFindAllTagsUseCase {
  constructor(private readonly tagRepository: ITagRepository, private readonly tagMapper: ITagApplicationMapper) {}

  async execute(options: IFindAllTagsUseCaseOptions): Promise<void> {
    const tags = await this.tagRepository.findAll()
    options.tagsFound(tags.map(this.tagMapper.toDTO))
  }
}
