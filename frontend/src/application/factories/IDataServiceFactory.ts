import { IUserService } from 'application/services/data/IUserService'
import { IStoryService } from 'application/services/data/IStoryService'
import { IImageService } from 'application/services/data/IImageService'
import { IProfileService } from 'application/services/data/IProfileService'

export interface IDataServiceFactory {
  createUserService(): IUserService
  createStoryService(): IStoryService
  createImageService(): IImageService
  createProfileService(): IProfileService
}
