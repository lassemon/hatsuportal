import { IUserService, IStoryService, IImageService, IProfileService, IPostService } from 'application/interfaces'

export interface IDataServiceFactory {
  createUserService(): IUserService
  createPostService(): IPostService
  createStoryService(): IStoryService
  createImageService(): IImageService
  createProfileService(): IProfileService
}
