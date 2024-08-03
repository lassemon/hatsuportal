import { DomainError, EntityFactoryResult } from '@hatsuportal/common-bounded-context'
import { Story, StoryProps } from '../../domain'

export interface IStoryFactory {
  createStory(props: StoryProps): EntityFactoryResult<Story, DomainError>
}
