import { ICreateStoryUseCase } from '../useCases/story/CreateStoryUseCase'
import { IDeleteStoryUseCase } from '../useCases/story/DeleteStoryUseCase'
import { IFindStoryUseCase } from '../useCases/story/FindStoryUseCase'
import { IFindMyStoriesUseCase } from '../useCases/story/FindMyStoriesUseCase'
import { IRemoveImageFromStoryUseCase } from '../useCases/story/RemoveCoverImageFromStoryUseCase'
import { ISearchStoriesUseCase } from '../useCases/story/SearchStoriesUseCase'
import { IUpdateStoryUseCase } from '../useCases/story/UpdateStoryUseCase'
import { IFindAllTagsUseCase } from '../useCases/tag/FindAllTagsUseCase'
import { IGetRepliesUseCase } from '../useCases/comment/GetRepliesUseCase'
import { IGetCommentsUseCase } from '../useCases/comment/GetCommentsUseCase'
import { IAddCommentUseCase } from '../useCases/comment/AddCommentUseCase'
import { IEditCommentUseCase } from '../useCases/comment/EditCommentUseCase'
import { ISoftDeleteCommentUseCase } from '../useCases/comment/SoftDeleteCommentUseCase'

export interface IUseCaseFactory {
  createCreateStoryUseCase(): ICreateStoryUseCase
  createDeleteStoryUseCase(): IDeleteStoryUseCase
  createFindStoryUseCase(): IFindStoryUseCase
  createFindMyStoriesUseCase(): IFindMyStoriesUseCase
  createSearchStoriesUseCase(): ISearchStoriesUseCase
  createUpdateStoryUseCase(): IUpdateStoryUseCase
  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase
  createFindAllTagsUseCase(): IFindAllTagsUseCase
  createGetCommentsUseCase(): IGetCommentsUseCase
  createGetRepliesUseCase(): IGetRepliesUseCase
  createAddCommentUseCase(): IAddCommentUseCase
  createEditCommentUseCase(): IEditCommentUseCase
  createSoftDeleteCommentUseCase(): ISoftDeleteCommentUseCase
}
