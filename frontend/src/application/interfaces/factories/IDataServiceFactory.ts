import { IUserService, IStoryService, IImageService, IProfileService } from 'application/interfaces'

export interface IDataServiceFactory {
  createUserService(): IUserService
  createStoryService(): IStoryService
  createImageService(): IImageService
  createProfileService(): IProfileService
}
