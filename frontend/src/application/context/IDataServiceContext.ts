import { IImageService } from 'application/services/data/IImageService'
import { IProfileService } from 'application/services/data/IProfileService'
import { IStoryService } from 'application/services/data/IStoryService'
import { IUserService } from 'application/services/data/IUserService'

export interface IDataServiceContext {
  userService: IUserService
  storyService: IStoryService
  profileService: IProfileService
  imageService: IImageService
}
