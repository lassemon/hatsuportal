import {
  IFindStoryUseCase,
  IFindStoryUseCaseOptions,
  IStoryApplicationMapper,
  IStoryRepository,
  PostId
} from '@hatsuportal/post-management'
import { NotFoundError } from '@hatsuportal/common-bounded-context'

export class FindStoryUseCase implements IFindStoryUseCase {
  constructor(private readonly storyRepository: IStoryRepository, private readonly storyApplicationMapper: IStoryApplicationMapper) {}

  async execute({ findStoryInput, storyFound }: IFindStoryUseCaseOptions): Promise<void> {
    const { storyIdToFind } = findStoryInput
    const story = await this.storyRepository.findById(new PostId(storyIdToFind))

    if (!story) throw new NotFoundError()

    storyFound(this.storyApplicationMapper.toDTO(story))
  }
}
