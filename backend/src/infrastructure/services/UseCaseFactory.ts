import {
  ICreateStoryUseCase,
  IDeleteStoryUseCase,
  IFindStoryUseCase,
  IFindMyStoriesUseCase,
  ISearchStoriesUseCase,
  IUpdateStoryUseCase,
  IFindAllTagsUseCase,
  IGetRepliesUseCase,
  IGetCommentsUseCase,
  IAddCommentUseCase,
  IEditCommentUseCase,
  ISoftDeleteCommentUseCase,
  IHardDeleteCommentUseCase,
  IUseCaseFactory as IPostUseCaseFactory
} from '@hatsuportal/post-management'

import {
  ICreateImageUseCase,
  IFindImageUseCase,
  IUpdateImageUseCase,
  IUseCaseFactory as IMediaUseCaseFactory,
  ICreateStagedImageVersionUseCase,
  IPromoteImageVersionUseCase,
  IDeleteImageUseCase,
  IDiscardImageVersionUseCase
} from '@hatsuportal/media-management'

import {
  ILoginUserUseCase,
  IRefreshTokenUseCase,
  IGetUserProfileUseCase,
  IUseCaseFactory as IUserUseCaseFactory,
  IGetAllUsersUseCase,
  ICreateUserUseCase,
  IUpdateUserUseCase,
  IDeactivateUserUseCase,
  IFindUserUseCase
} from '@hatsuportal/user-management'

export type IUseCaseFactory = IPostUseCaseFactory & IUserUseCaseFactory & IMediaUseCaseFactory

/*
 * Importing cached versions of repositories here instead of dependency injection
 * because this is where the requestContext (i.e. use case) starts and is a logical place to decide
 * if we want to use cached repositories or not, the IoC container does not have to know about it.
 */
export class UseCaseFactory implements IPostUseCaseFactory, IUserUseCaseFactory, IMediaUseCaseFactory {
  constructor(
    private readonly userUseCaseFactory: IUserUseCaseFactory,
    private readonly mediaUseCaseFactory: IMediaUseCaseFactory,
    private readonly postUseCaseFactory: IPostUseCaseFactory
  ) {}

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return this.userUseCaseFactory.createLoginUserUseCase()
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return this.userUseCaseFactory.createRefreshTokenUseCase()
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    return this.userUseCaseFactory.createCreateUserUseCase()
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    return this.userUseCaseFactory.createUpdateUserUseCase()
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    return this.userUseCaseFactory.createDeactivateUserUseCase()
  }

  createFindUserUseCase(): IFindUserUseCase {
    return this.userUseCaseFactory.createFindUserUseCase()
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    return this.userUseCaseFactory.createGetAllUsersUseCase()
  }

  // story
  createCreateStoryUseCase(): ICreateStoryUseCase {
    return this.postUseCaseFactory.createCreateStoryUseCase()
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    return this.postUseCaseFactory.createUpdateStoryUseCase()
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    return this.postUseCaseFactory.createDeleteStoryUseCase()
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    return this.postUseCaseFactory.createSearchStoriesUseCase()
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    return this.postUseCaseFactory.createFindStoryUseCase()
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    return this.postUseCaseFactory.createFindMyStoriesUseCase()
  }

  // comment
  createGetCommentsUseCase(): IGetCommentsUseCase {
    return this.postUseCaseFactory.createGetCommentsUseCase()
  }

  createGetRepliesUseCase(): IGetRepliesUseCase {
    return this.postUseCaseFactory.createGetRepliesUseCase()
  }

  createAddCommentUseCase(): IAddCommentUseCase {
    return this.postUseCaseFactory.createAddCommentUseCase()
  }

  createEditCommentUseCase(): IEditCommentUseCase {
    return this.postUseCaseFactory.createEditCommentUseCase()
  }

  createSoftDeleteCommentUseCase(): ISoftDeleteCommentUseCase {
    return this.postUseCaseFactory.createSoftDeleteCommentUseCase()
  }

  createHardDeleteCommentUseCase(): IHardDeleteCommentUseCase {
    return this.postUseCaseFactory.createHardDeleteCommentUseCase()
  }

  // tag
  createFindAllTagsUseCase(): IFindAllTagsUseCase {
    return this.postUseCaseFactory.createFindAllTagsUseCase()
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    return this.mediaUseCaseFactory.createCreateImageUseCase()
  }

  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase {
    return this.mediaUseCaseFactory.createCreateStagedImageVersionUseCase()
  }

  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase {
    return this.mediaUseCaseFactory.createPromoteImageVersionUseCase()
  }

  createDiscardImageVersionUseCase(): IDiscardImageVersionUseCase {
    return this.mediaUseCaseFactory.createDiscardImageVersionUseCase()
  }

  createDeleteImageUseCase(): IDeleteImageUseCase {
    return this.mediaUseCaseFactory.createDeleteImageUseCase()
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    return this.mediaUseCaseFactory.createUpdateImageUseCase()
  }

  createFindImageUseCase(): IFindImageUseCase {
    return this.mediaUseCaseFactory.createFindImageUseCase()
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return this.userUseCaseFactory.createGetUserProfileUseCase()
  }
}
