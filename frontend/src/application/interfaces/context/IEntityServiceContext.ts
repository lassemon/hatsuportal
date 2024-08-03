import { IImageService, IProfileService, IStoryService, IUserService, ITagService, IPostService } from 'application/interfaces'

export interface IEntityServiceContext {
  userService: IUserService
  postService: IPostService
  storyService: IStoryService
  profileService: IProfileService
  imageService: IImageService
  tagService: ITagService
}
