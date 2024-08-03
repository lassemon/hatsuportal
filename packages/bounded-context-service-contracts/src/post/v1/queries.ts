import { StoryContract } from './contracts'

export interface IPostQueryFacade {
  getStoriesByCreatorId(creatorId: string): Promise<StoryContract[]>
}
