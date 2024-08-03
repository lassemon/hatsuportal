import {
  IImageService,
  IProfileService,
  IPreferencesService,
  IStoryService,
  IUserService,
  ITagService,
  IPostService,
  IThemeService
} from 'application/interfaces'

export interface IEntityServiceContext {
  userService: IUserService
  postService: IPostService
  storyService: IStoryService
  profileService: IProfileService
  preferencesService: IPreferencesService
  themeService: IThemeService
  imageService: IImageService
  tagService: ITagService
}
