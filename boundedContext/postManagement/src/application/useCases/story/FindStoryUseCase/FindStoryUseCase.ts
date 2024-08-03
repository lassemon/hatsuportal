import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { PostId } from '../../../../domain'
import { NotFoundError } from '@hatsuportal/platform'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { FindStoryInputDTO } from '../../../dtos/useCase/FindStoryInputDTO'
import { StoryWithRelationsDTO } from '../../../dtos/post/story/StoryWithRelationsDTO'

const logger = new Logger('FindStoryUseCase')

export interface IFindStoryUseCaseOptions extends IUseCaseOptions {
  loggedInUserId?: string
  findStoryInput: FindStoryInputDTO
  storyFound(story: StoryWithRelationsDTO): void
}

export type IFindStoryUseCase = IUseCase<IFindStoryUseCaseOptions>

export class FindStoryUseCase implements IFindStoryUseCase {
  constructor(private readonly storyLookupService: IStoryLookupService) {}

  async execute({ findStoryInput, storyFound }: IFindStoryUseCaseOptions): Promise<void> {
    logger.debug('Finding story by id', findStoryInput.storyIdToFind)
    const { storyIdToFind } = findStoryInput
    const story = await this.storyLookupService.findById(new PostId(storyIdToFind))

    if (!story) throw new NotFoundError()

    storyFound(story)
  }
}
