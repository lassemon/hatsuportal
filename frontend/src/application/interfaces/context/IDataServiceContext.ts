import { IImageService, IProfileService, IStoryService, IUserService } from 'application/interfaces'

export interface IDataServiceContext {
  userService: IUserService
  storyService: IStoryService
  profileService: IProfileService
  imageService: IImageService
}
