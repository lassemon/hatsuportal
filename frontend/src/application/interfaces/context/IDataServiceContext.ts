import { IImageService, IProfileService, IStoryService, IUserService, ITagService } from 'application/interfaces'

export interface IDataServiceContext {
  userService: IUserService
  storyService: IStoryService
  profileService: IProfileService
  imageService: IImageService
  tagService: ITagService
}
