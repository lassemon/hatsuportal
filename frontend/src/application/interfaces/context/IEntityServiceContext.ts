import { IImageService, IProfileService, IPreferencesService, IStoryService, IUserService, ITagService, IPostService } from 'application/interfaces'

export interface IEntityServiceContext {
  userService: IUserService
  postService: IPostService
  storyService: IStoryService
  profileService: IProfileService
  preferencesService: IPreferencesService
  imageService: IImageService
  tagService: ITagService
}
