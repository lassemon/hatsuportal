import {
  ICreateStoryUseCase,
  IDeleteStoryUseCase,
  IFindStoryUseCase,
  IFindMyStoriesUseCase,
  IStoryApplicationMapper,
  IRemoveImageFromStoryUseCase,
  ISearchStoriesUseCase,
  IUpdateStoryUseCase,
  IStoryReadRepository,
  IStoryWriteRepository,
  ITagRepository,
  IFindAllTagsUseCase,
  ITagApplicationMapper,
  ICommentReadRepository,
  IGetRepliesUseCase,
  IGetCommentsUseCase,
  IAddCommentUseCase,
  ICommentWriteRepository,
  IPostReadRepository,
  IEditCommentUseCase,
  ISoftDeleteCommentUseCase,
  ICommentApplicationMapper,
  IPostAuthorizationService,
  CommentLookupService,
  StoryLookupService,
  CreateStoryUseCase,
  CreateStoryUseCaseWithValidation,
  UpdateStoryUseCase,
  UpdateStoryUseCaseWithValidation,
  DeleteStoryUseCase,
  DeleteStoryUseCaseWithValidation,
  SearchStoriesUseCase,
  SearchStoriesUseCaseWithValidation,
  FindStoryUseCase,
  FindStoryUseCaseWithValidation,
  FindMyStoriesUseCase,
  FindMyStoriesUseCaseWithValidation,
  GetCommentsUseCase,
  GetCommentsUseCaseWithValidation,
  GetRepliesUseCase,
  GetRepliesUseCaseWithValidation,
  AddCommentUseCase,
  AddCommentUseCaseWithValidation,
  EditCommentUseCase,
  EditCommentUseCaseWithValidation,
  SoftDeleteCommentUseCase,
  SoftDeleteCommentUseCaseWithValidation,
  FindAllTagsUseCase,
  FindAllTagsUseCaseWithValidation,
  RemoveImageFromStoryUseCase,
  RemoveImageFromStoryUseCaseWithValidation,
  IMediaGateway as IMediaGatewayForPostManagement,
  MediaGateway as MediaGatewayForPostManagement,
  MediaGatewayMapper as MediaGatewayMapperForPostManagement,
  IUserGateway as IUserGatewayForPostManagement,
  UserGateway as UserGatewayForPostManagement,
  UserGatewayMapper as UserGatewayMapperForPostManagement,
  IUseCaseFactory as IPostUseCaseFactory
} from '@hatsuportal/post-management'

import {
  CreateImageUseCase,
  FindImageUseCase,
  ICreateImageUseCase,
  IFindImageUseCase,
  IImageApplicationMapper,
  IImageRepository,
  IMediaAuthorizationService,
  IStorageKeyGenerator,
  IUpdateImageUseCase,
  UpdateImageUseCase,
  CreateImageUseCaseWithValidation,
  UpdateImageUseCaseWithValidation,
  FindImageUseCaseWithValidation,
  IUseCaseFactory as IMediaUseCaseFactory,
  IUserGateway as IUserGatewayForMediaManagement,
  UserGateway as UserGatewayForMediaManagement,
  UserGatewayMapper as UserGatewayMapperForMediaManagement,
  ICreateStagedImageVersionUseCase,
  CreateStagedImageVersionUseCase,
  PromoteImageVersionUseCase,
  IPromoteImageVersionUseCase,
  DeleteImageUseCase,
  IDeleteImageUseCase,
  DiscardImageVersionUseCase,
  IDiscardImageVersionUseCase,
  DeleteImageUseCaseWithValidation,
  MediaQueryFacade,
  MediaQueryMapper,
  MediaCommandFacade,
  MediaCommandMapper
} from '@hatsuportal/media-management'

import {
  IUserRepository,
  IUserService,
  ILoginUserUseCase,
  IRefreshTokenUseCase,
  ICreateUserUseCase,
  IDeactivateUserUseCase,
  IFindUserUseCase,
  IGetAllUsersUseCase,
  IGetUserProfileUseCase,
  IUpdateUserUseCase,
  IUserApplicationMapper,
  CreateUserUseCase,
  CreateUserUseCaseWithValidation,
  IUseCaseFactory as IUserUseCaseFactory,
  ITokenService,
  IUserAuthorizationService,
  LoginUserUseCaseWithValidation,
  LoginUserUseCase,
  RefreshTokenUseCaseWithValidation,
  RefreshTokenUseCase,
  UpdateUserUseCaseWithValidation,
  UpdateUserUseCase,
  DeactivateUserUseCaseWithValidation,
  DeactivateUserUseCase,
  FindUserUseCaseWithValidation,
  FindUserUseCase,
  GetAllUsersUseCaseWithValidation,
  GetAllUsersUseCase,
  GetUserProfileUseCase,
  UserQueryFacade,
  UserQueryMapper,
  IPasswordFactory
  //UserCommandFacade,
  //UserCommandMapper
} from '@hatsuportal/user-management'

import { ErrorHandlingUseCaseDecorator, ITransactionAware } from '@hatsuportal/platform'
import { UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ITransactionManager } from '@hatsuportal/platform'

export type IUseCaseFactory = IPostUseCaseFactory & IUserUseCaseFactory & IMediaUseCaseFactory

/*
 * Importing cached versions of repositories here instead of dependency injection
 * because this is where the requestContext (i.e. use case) starts and is a logical place to decide
 * if we want to use cached repositories or not, the IoC container does not have to know about it.
 */
import { UserRepositoryWithCache } from '@hatsuportal/user-management'
import { StoryWriteRepositoryWithCache, StoryReadRepositoryWithCache, CommentWriteRepositoryWithCache } from '@hatsuportal/post-management'
import { ImageRepositoryWithCache } from '@hatsuportal/media-management'
export class UseCaseFactory implements IPostUseCaseFactory, IUserUseCaseFactory, IMediaUseCaseFactory {
  private readonly mediaGatewayForPostManagement: IMediaGatewayForPostManagement
  private readonly userGatewayForPostManagement: IUserGatewayForPostManagement
  private readonly userGatewayForMediaManagement: IUserGatewayForMediaManagement

  constructor(
    // post management
    private readonly postAuthorizationService: IPostAuthorizationService,
    private readonly postReadRepository: IPostReadRepository & ITransactionAware,
    private readonly storyReadRepository: IStoryReadRepository & ITransactionAware,
    private readonly storyWriteRepository: IStoryWriteRepository & ITransactionAware,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly commentReadRepository: ICommentReadRepository & ITransactionAware,
    private readonly commentWriteRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentApplicationMapper: ICommentApplicationMapper,
    private readonly tagRepository: ITagRepository & ITransactionAware,
    private readonly tagApplicationMapper: ITagApplicationMapper,
    // media management
    private readonly mediaAuthorizationService: IMediaAuthorizationService,
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly imageApplicationMapper: IImageApplicationMapper,
    private readonly mediaStorageKeyGenerator: IStorageKeyGenerator,
    // user management
    private readonly userAuthorizationService: IUserAuthorizationService,
    private readonly userRepository: IUserRepository & ITransactionAware,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly tokenService: ITokenService,

    // general
    private readonly transactionManager: ITransactionManager<UniqueId, UnixTimestamp>,
    private readonly passwordFactory: IPasswordFactory
  ) {
    const userQueryFacade = new UserQueryFacade(this.userRepository, new UserQueryMapper())
    /*const userCommandFacade = new UserCommandFacade(
      this.createCreateUserUseCase(),
      this.createUpdateUserUseCase(),
      this.createDeactivateUserUseCase(),
      new UserCommandMapper()
    )*/
    const mediaQueryFacade = new MediaQueryFacade(this.imageRepository, new MediaQueryMapper())
    this.userGatewayForMediaManagement = new UserGatewayForMediaManagement(
      userQueryFacade,
      //userCommandFacade,
      new UserGatewayMapperForMediaManagement()
    )
    const mediaCommandFacade = new MediaCommandFacade(
      // THESE USE CASES ARE DEPENDENT ON userGatewayForMediaManagement, MUST INITIALIZE GATEWAY BEFORE USE CASES
      this.createCreateStagedImageVersionUseCase(),
      this.createPromoteImageVersionUseCase(),
      this.createDiscardImageVersionUseCase(),
      this.createUpdateImageUseCase(),
      this.createDeleteImageUseCase(),
      new MediaCommandMapper()
    )

    this.mediaGatewayForPostManagement = new MediaGatewayForPostManagement(
      mediaQueryFacade,
      mediaCommandFacade,
      new MediaGatewayMapperForPostManagement()
    )

    this.userGatewayForPostManagement = new UserGatewayForPostManagement(
      userQueryFacade,
      //userCommandFacade,
      new UserGatewayMapperForPostManagement()
    )
  }

  // auth
  createLoginUserUseCase(): ILoginUserUseCase {
    return new LoginUserUseCaseWithValidation(
      new LoginUserUseCase(this.userApplicationMapper, this.userRepository, this.tokenService),
      this.passwordFactory
    )
  }

  createRefreshTokenUseCase(): IRefreshTokenUseCase {
    return new RefreshTokenUseCaseWithValidation(new RefreshTokenUseCase(this.userRepository, this.tokenService))
  }

  // user
  createCreateUserUseCase(): ICreateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new CreateUserUseCaseWithValidation(
        new CreateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.transactionManager, this.passwordFactory),
        userRepositoryWithCache,
        this.userApplicationMapper,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createUpdateUserUseCase(): IUpdateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new UpdateUserUseCaseWithValidation(
        new UpdateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.userService, this.passwordFactory),
        userRepositoryWithCache,
        this.userApplicationMapper,
        this.userAuthorizationService,
        this.passwordFactory
      )
    )
  }

  createDeactivateUserUseCase(): IDeactivateUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new DeactivateUserUseCaseWithValidation(
        new DeactivateUserUseCase(userRepositoryWithCache, this.userApplicationMapper, this.transactionManager),
        userRepositoryWithCache,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }

  createFindUserUseCase(): IFindUserUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new FindUserUseCaseWithValidation(
        new FindUserUseCase(userRepositoryWithCache, this.userApplicationMapper),
        userRepositoryWithCache,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }

  createGetAllUsersUseCase(): IGetAllUsersUseCase {
    const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new GetAllUsersUseCaseWithValidation(
        new GetAllUsersUseCase(userRepositoryWithCache, this.userApplicationMapper),
        userRepositoryWithCache,
        this.userApplicationMapper,
        this.userAuthorizationService
      )
    )
  }

  // story
  createCreateStoryUseCase(): ICreateStoryUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new CreateStoryUseCaseWithValidation(
        new CreateStoryUseCase(
          this.userGatewayForPostManagement,
          this.mediaGatewayForPostManagement,
          this.storyWriteRepository,
          storyLookupService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        this.postAuthorizationService
      )
    )
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    const storyWriteRepositoryWithCache = new StoryWriteRepositoryWithCache(this.storyWriteRepository, new Map())
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new UpdateStoryUseCaseWithValidation(
        new UpdateStoryUseCase(
          this.mediaGatewayForPostManagement,
          storyWriteRepositoryWithCache,
          storyLookupService,
          this.tagRepository,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        storyWriteRepositoryWithCache,
        this.storyApplicationMapper,
        this.postAuthorizationService
      )
    )
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    const storyRepositoryWithCache = new StoryWriteRepositoryWithCache(this.storyWriteRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new DeleteStoryUseCaseWithValidation(
        new DeleteStoryUseCase(
          this.mediaGatewayForPostManagement,
          storyRepositoryWithCache,
          this.storyApplicationMapper,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        storyRepositoryWithCache,
        this.storyApplicationMapper,
        this.postAuthorizationService
      )
    )
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new SearchStoriesUseCaseWithValidation(
        new SearchStoriesUseCase(storyLookupService, this.userGatewayForPostManagement),
        this.userGatewayForPostManagement,
        this.postAuthorizationService
      )
    )
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    const storyReadRepositoryWithCache = new StoryReadRepositoryWithCache(this.storyReadRepository, new Map())
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new FindStoryUseCaseWithValidation(
        new FindStoryUseCase(storyLookupService),
        this.userGatewayForPostManagement,
        storyReadRepositoryWithCache,
        this.postAuthorizationService
      )
    )
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new FindMyStoriesUseCaseWithValidation(new FindMyStoriesUseCase(storyLookupService), this.userGatewayForPostManagement)
    )
  }

  // comment
  createGetCommentsUseCase(): IGetCommentsUseCase {
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    return new ErrorHandlingUseCaseDecorator(new GetCommentsUseCaseWithValidation(new GetCommentsUseCase(commentLookupService)))
  }

  createGetRepliesUseCase(): IGetRepliesUseCase {
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    return new ErrorHandlingUseCaseDecorator(new GetRepliesUseCaseWithValidation(new GetRepliesUseCase(commentLookupService)))
  }

  createAddCommentUseCase(): IAddCommentUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentWriteRepositoryWithCache = new CommentWriteRepositoryWithCache(this.commentWriteRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    return new ErrorHandlingUseCaseDecorator(
      new AddCommentUseCaseWithValidation(
        new AddCommentUseCase(
          commentWriteRepositoryWithCache,
          this.commentApplicationMapper,
          commentLookupService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        this.postAuthorizationService,
        this.postReadRepository,
        commentWriteRepositoryWithCache
      )
    )
  }

  createEditCommentUseCase(): IEditCommentUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentWriteRepositoryWithCache = new CommentWriteRepositoryWithCache(this.commentWriteRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    return new ErrorHandlingUseCaseDecorator(
      new EditCommentUseCaseWithValidation(
        new EditCommentUseCase(
          commentWriteRepositoryWithCache,
          this.commentApplicationMapper,
          commentLookupService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        commentWriteRepositoryWithCache,
        this.postAuthorizationService
      )
    )
  }

  createSoftDeleteCommentUseCase(): ISoftDeleteCommentUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentWriteRepositoryWithCache = new CommentWriteRepositoryWithCache(this.commentWriteRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    return new ErrorHandlingUseCaseDecorator(
      new SoftDeleteCommentUseCaseWithValidation(
        new SoftDeleteCommentUseCase(commentWriteRepositoryWithCache, commentLookupService, this.transactionManager),
        this.userGatewayForPostManagement,
        commentWriteRepositoryWithCache,
        this.postAuthorizationService
      )
    )
  }

  createRemoveImageFromStoryUseCase(): IRemoveImageFromStoryUseCase {
    const storyWriteRepositoryWithCache = new StoryWriteRepositoryWithCache(this.storyWriteRepository, new Map())
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const commentLookupService = new CommentLookupService(this.commentReadRepository, this.userGatewayForPostManagement)
    const storyLookupService = new StoryLookupService(
      this.storyReadRepository,
      this.mediaGatewayForPostManagement,
      this.tagRepository,
      this.userGatewayForPostManagement,
      commentLookupService,
      this.storyApplicationMapper
    )
    return new ErrorHandlingUseCaseDecorator(
      new RemoveImageFromStoryUseCaseWithValidation(
        new RemoveImageFromStoryUseCase(
          storyWriteRepositoryWithCache,
          this.mediaGatewayForPostManagement,
          storyLookupService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        storyWriteRepositoryWithCache,
        this.storyApplicationMapper,
        this.postAuthorizationService
      )
    )
  }

  // tag
  createFindAllTagsUseCase(): IFindAllTagsUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindAllTagsUseCaseWithValidation(new FindAllTagsUseCase(this.tagRepository, this.tagApplicationMapper))
    )
  }

  // image
  createCreateImageUseCase(): ICreateImageUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new CreateImageUseCaseWithValidation(
        new CreateImageUseCase(
          this.userGatewayForMediaManagement,
          this.imageRepository,
          this.imageApplicationMapper,
          this.mediaStorageKeyGenerator,
          this.transactionManager
        ),
        this.userGatewayForMediaManagement,
        this.mediaAuthorizationService
      )
    )
  }

  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateStagedImageVersionUseCase(this.imageRepository, this.transactionManager, this.mediaStorageKeyGenerator)
    )
  }

  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new PromoteImageVersionUseCase(
        this.imageRepository,
        this.imageApplicationMapper,
        this.transactionManager,
        this.mediaStorageKeyGenerator
      )
    )
  }

  createDiscardImageVersionUseCase(): IDiscardImageVersionUseCase {
    return new ErrorHandlingUseCaseDecorator(new DiscardImageVersionUseCase(this.imageRepository, this.transactionManager))
  }

  createDeleteImageUseCase(): IDeleteImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeleteImageUseCaseWithValidation(
        new DeleteImageUseCase(this.imageRepository, this.imageApplicationMapper, this.transactionManager),
        this.userGatewayForMediaManagement,
        this.imageRepository,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createUpdateImageUseCase(): IUpdateImageUseCase {
    // TODO: how to cache duplicate queries?
    // const userRepositoryWithCache = new UserRepositoryWithCache(this.userRepository, new Map())
    const imageRepositoryWithCache = new ImageRepositoryWithCache(this.imageRepository, new Map())
    return new ErrorHandlingUseCaseDecorator(
      new UpdateImageUseCaseWithValidation(
        new UpdateImageUseCase(
          this.userGatewayForMediaManagement,
          imageRepositoryWithCache,
          this.imageApplicationMapper,
          this.mediaStorageKeyGenerator,
          this.transactionManager
        ),
        this.userGatewayForMediaManagement,
        imageRepositoryWithCache,
        this.imageApplicationMapper,
        this.mediaAuthorizationService
      )
    )
  }

  createFindImageUseCase(): IFindImageUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindImageUseCaseWithValidation(
        new FindImageUseCase(this.imageRepository, this.imageApplicationMapper, this.userGatewayForMediaManagement)
      )
    )
  }

  // profile
  createGetUserProfileUseCase(): IGetUserProfileUseCase {
    return new ErrorHandlingUseCaseDecorator(new GetUserProfileUseCase())
  }
}
