import { DomainError, EntityFactoryResult } from '@hatsuportal/common-bounded-context'
import { IStoryFactory, Story, StoryProps } from '@hatsuportal/post-management'

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
