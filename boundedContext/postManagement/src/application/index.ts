export type { IUseCaseFactory } from './services/IUseCaseFactory'
export { StoryLookupService, type IStoryLookupService } from './services/story/StoryLookupService'
export { CommentLookupService, type ICommentLookupService } from './services/comment/CommentLookupService'

export { PostAuthorizationService, type IPostAuthorizationService } from './authorization/services/PostAuthorizationService'

export { CoverImageAddedToStoryHandler } from './domainEventHandlers/CoverImageAddedToStoryHandler'
export { CoverImageUpdatedToStoryHandler } from './domainEventHandlers/CoverImageUpdatedToStoryHandler'
export { CoverImageRemovedFromStoryHandler } from './domainEventHandlers/CoverImageRemovedFromStoryHandler'

export { StoryCreatedHandler } from './domainEventHandlers/StoryCreatedHandler'
export { StoryUpdatedHandler } from './domainEventHandlers/StoryUpdatedHandler'
export { StoryDeletedHandler } from './domainEventHandlers/StoryDeletedHandler'

// Story use cases
export {
  CreateStoryUseCase,
  CreateStoryUseCaseWithValidation,
  type ICreateStoryUseCase,
  type ICreateStoryUseCaseOptions
} from './useCases/story/CreateStoryUseCase'
export {
  DeleteStoryUseCase,
  DeleteStoryUseCaseWithValidation,
  type IDeleteStoryUseCase,
  type IDeleteStoryUseCaseOptions
} from './useCases/story/DeleteStoryUseCase'
export {
  FindStoryUseCase,
  FindStoryUseCaseWithValidation,
  type IFindStoryUseCase,
  type IFindStoryUseCaseOptions
} from './useCases/story/FindStoryUseCase'
export {
  FindMyStoriesUseCase,
  FindMyStoriesUseCaseWithValidation,
  type IFindMyStoriesUseCase,
  type IFindMyStoriesUseCaseOptions
} from './useCases/story/FindMyStoriesUseCase'
export {
  SearchStoriesUseCase,
  SearchStoriesUseCaseWithValidation,
  type ISearchStoriesUseCase,
  type ISearchStoriesUseCaseOptions
} from './useCases/story/SearchStoriesUseCase'
export {
  UpdateStoryUseCase,
  UpdateStoryUseCaseWithValidation,
  type IUpdateStoryUseCase,
  type IUpdateStoryUseCaseOptions
} from './useCases/story/UpdateStoryUseCase'
export {
  RemoveImageFromStoryUseCase,
  RemoveImageFromStoryUseCaseWithValidation,
  type IRemoveImageFromStoryUseCase,
  type IRemoveImageFromStoryUseCaseOptions
} from './useCases/story/RemoveCoverImageFromStoryUseCase'

// Tag use cases
export {
  FindAllTagsUseCase,
  FindAllTagsUseCaseWithValidation,
  type IFindAllTagsUseCase,
  type IFindAllTagsUseCaseOptions
} from './useCases/tag/FindAllTagsUseCase'

// Comment use cases
export {
  GetCommentsUseCase,
  GetCommentsUseCaseWithValidation,
  type IGetCommentsUseCase,
  type IGetCommentsUseCaseOptions
} from './useCases/comment/GetCommentsUseCase'
export {
  GetRepliesUseCase,
  GetRepliesUseCaseWithValidation,
  type IGetRepliesUseCase,
  type IGetRepliesUseCaseOptions
} from './useCases/comment/GetRepliesUseCase'
export {
  AddCommentUseCase,
  AddCommentUseCaseWithValidation,
  type IAddCommentUseCase,
  type IAddCommentUseCaseOptions
} from './useCases/comment/AddCommentUseCase'
export {
  EditCommentUseCase,
  EditCommentUseCaseWithValidation,
  type IEditCommentUseCase,
  type IEditCommentUseCaseOptions
} from './useCases/comment/EditCommentUseCase'
export {
  SoftDeleteCommentUseCase,
  SoftDeleteCommentUseCaseWithValidation,
  type ISoftDeleteCommentUseCase,
  type ISoftDeleteCommentUseCaseOptions
} from './useCases/comment/SoftDeleteCommentUseCase'
//export type { IHardDeleteCommentUseCase, IHardDeleteCommentUseCaseOptions } from './useCases/comment/HardDeleteCommentUseCase'

export { StoryApplicationMapper, type IStoryApplicationMapper } from './mappers/StoryApplicationMapper'
export { TagApplicationMapper, type ITagApplicationMapper } from './mappers/TagApplicationMapper'
export { CommentApplicationMapper, type ICommentApplicationMapper } from './mappers/CommentApplicationMapper'

export type { IStoryApiMapper } from './dataAccess/http/IStoryApiMapper'
export type { ITagApiMapper } from './dataAccess/http/ITagApiMapper'
export type { ICommentApiMapper } from './dataAccess/http/ICommentApiMapper'

export type { IPostReadRepository } from './read/IPostReadRepository'
export type { IStoryReadRepository } from './read/IStoryReadRepository'
export type { ICommentReadRepository } from './read/ICommentReadRepository'

export * from './dtos'

export type { IMediaGateway } from './acl/mediaManagement/IMediaGateway'
export { MediaGateway } from '../infrastructure/acl/mediaManagement/gateways/MediaGateway'
export type { IMediaGatewayMapper } from './acl/mediaManagement/mappers/IMediaGatewayMapper'
export { MediaGatewayMapper } from '../infrastructure/acl/mediaManagement/mappers/MediaGatewayMapper'

export type { IUserGateway } from './acl/userManagement/IUserGateway'
export { UserGateway } from '../infrastructure/acl/userManagement/gateways/UserGateway'
export type { IUserGatewayMapper } from './acl/userManagement/mappers/IUserGatewayMapper'
export { UserGatewayMapper } from '../infrastructure/acl/userManagement/mappers/UserGatewayMapper'

export { ImageLoadResult } from './acl/mediaManagement/outcomes/ImageLoadResult'
export { ImageLoadError } from './acl/mediaManagement/errors/ImageLoadError'
