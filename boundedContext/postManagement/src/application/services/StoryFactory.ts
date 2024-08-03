import { Story, StoryProps } from '../../domain'
import { DomainError, EntityFactoryResult } from '@hatsuportal/foundation'

export interface IStoryFactory {
  createStory(props: StoryProps): EntityFactoryResult<Story, DomainError>
}

// TODO, remove this factory, its a not needed abstraction, favour creator methods in Story domain entity instead
export class StoryFactory implements IStoryFactory {
  createStory(props: StoryProps): EntityFactoryResult<Story, DomainError> {
    try {
      const story = Story.create(props)
      return EntityFactoryResult.ok(story)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }

      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating story',
          cause: error
        })
      )
    }
  }
}
