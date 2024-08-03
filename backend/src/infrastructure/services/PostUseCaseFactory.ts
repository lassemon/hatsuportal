import { ErrorHandlingUseCaseDecorator, IDomainEventService, ITransactionAware, ITransactionManager } from '@hatsuportal/platform'
import {
  AddCommentUseCase,
  AddCommentUseCaseWithValidation,
  CommentLookupService,
  CreateStoryUseCase,
  CreateStoryUseCaseWithValidation,
  DeleteStoryUseCase,
  DeleteStoryUseCaseWithValidation,
  EditCommentUseCase,
  EditCommentUseCaseWithValidation,
  FindAllTagsUseCase,
  FindAllTagsUseCaseWithValidation,
  FindMyStoriesUseCase,
  FindMyStoriesUseCaseWithValidation,
  FindStoryUseCase,
  FindStoryUseCaseWithValidation,
  GetCommentsUseCase,
  GetCommentsUseCaseWithValidation,
  GetRepliesUseCase,
  GetRepliesUseCaseWithValidation,
  HardDeleteCommentUseCase,
  HardDeleteCommentUseCaseWithValidation,
  IAddCommentUseCase,
  ICommentAuthorizationService,
  ICommentLookupService,
  ICommentReadRepository,
  ICommentWriteRepository,
  ICreateStoryUseCase,
  IDeleteStoryUseCase,
  IEditCommentUseCase,
  IFindAllTagsUseCase,
  IFindMyStoriesUseCase,
  IFindStoryUseCase,
  IGetCommentsUseCase,
  IGetRepliesUseCase,
  IHardDeleteCommentUseCase,
  IMediaGateway,
  IPostReadRepository,
  IUseCaseFactory as IPostUseCaseFactory,
  IResolveStoryTagIdsService,
  ISearchPostsUseCase,
  ISearchStoriesUseCase,
  ISoftDeleteCommentUseCase,
  IPostApplicationMapper,
  IStoryApplicationMapper,
  IStoryAuthorizationService,
  IStoryListSearchService,
  IStoryLookupService,
  IStoryReadRepository,
  IStoryWriteRepository,
  ITagApplicationMapper,
  ITagRepository,
  IUpdateStoryUseCase,
  IUserGateway,
  PostId,
  SearchPostsUseCase,
  SearchPostsUseCaseWithValidation,
  SearchStoriesUseCase,
  SearchStoriesUseCaseWithValidation,
  SoftDeleteCommentUseCase,
  SoftDeleteCommentUseCaseWithValidation,
  UpdateStoryUseCase,
  UpdateStoryUseCaseWithValidation
} from '@hatsuportal/post-management'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export class PostUseCaseFactory implements IPostUseCaseFactory {
  constructor(
    private readonly userGatewayForPostManagement: IUserGateway,
    private readonly mediaGatewayForPostManagement: IMediaGateway,
    private readonly storyAuthorizationService: IStoryAuthorizationService,
    private readonly commentAuthorizationService: ICommentAuthorizationService,
    private readonly postReadRepository: IPostReadRepository & ITransactionAware,
    private readonly storyReadRepository: IStoryReadRepository & ITransactionAware,
    private readonly storyWriteRepository: IStoryWriteRepository & ITransactionAware,
    private readonly storyApplicationMapper: IStoryApplicationMapper,
    private readonly postApplicationMapper: IPostApplicationMapper,
    private readonly storyLookupService: IStoryLookupService,
    private readonly storyListSearchService: IStoryListSearchService,
    private readonly transactionManager: ITransactionManager<PostId, UnixTimestamp>,
    private readonly commentReadRepository: ICommentReadRepository & ITransactionAware,
    private readonly commentWriteRepository: ICommentWriteRepository & ITransactionAware,
    private readonly commentLookupService: ICommentLookupService,
    private readonly tagRepository: ITagRepository & ITransactionAware,
    private readonly tagApplicationMapper: ITagApplicationMapper,
    private readonly resolveStoryTagIdsService: IResolveStoryTagIdsService,
    private readonly domainEventService: IDomainEventService
  ) {}

  // story
  createCreateStoryUseCase(): ICreateStoryUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new CreateStoryUseCaseWithValidation(
        new CreateStoryUseCase(
          this.userGatewayForPostManagement,
          this.mediaGatewayForPostManagement,
          this.storyWriteRepository,
          this.storyLookupService,
          this.tagRepository,
          this.resolveStoryTagIdsService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        this.storyAuthorizationService
      )
    )
  }

  createUpdateStoryUseCase(): IUpdateStoryUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new UpdateStoryUseCaseWithValidation(
        new UpdateStoryUseCase(
          this.mediaGatewayForPostManagement,
          this.storyWriteRepository,
          this.storyLookupService,
          this.tagRepository,
          this.resolveStoryTagIdsService,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        this.storyWriteRepository,
        this.storyApplicationMapper,
        this.storyAuthorizationService
      )
    )
  }

  createDeleteStoryUseCase(): IDeleteStoryUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new DeleteStoryUseCaseWithValidation(
        new DeleteStoryUseCase(
          this.mediaGatewayForPostManagement,
          this.storyWriteRepository,
          this.storyApplicationMapper,
          this.transactionManager
        ),
        this.userGatewayForPostManagement,
        this.storyWriteRepository,
        this.storyApplicationMapper,
        this.storyAuthorizationService
      )
    )
  }

  createSearchStoriesUseCase(): ISearchStoriesUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new SearchStoriesUseCaseWithValidation(
        new SearchStoriesUseCase(this.storyListSearchService),
        this.userGatewayForPostManagement,
        this.storyAuthorizationService
      )
    )
  }

  createSearchPostsUseCase(): ISearchPostsUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new SearchPostsUseCaseWithValidation(
        new SearchPostsUseCase(
          this.storyListSearchService,
          this.storyLookupService,
          this.postReadRepository,
          this.userGatewayForPostManagement,
          this.postApplicationMapper
        ),
        this.userGatewayForPostManagement,
        this.postApplicationMapper,
        this.storyAuthorizationService
      )
    )
  }

  createFindStoryUseCase(): IFindStoryUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindStoryUseCaseWithValidation(
        new FindStoryUseCase(this.storyLookupService),
        this.userGatewayForPostManagement,
        this.storyReadRepository,
        this.storyAuthorizationService
      )
    )
  }

  createFindMyStoriesUseCase(): IFindMyStoriesUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindMyStoriesUseCaseWithValidation(new FindMyStoriesUseCase(this.storyLookupService), this.userGatewayForPostManagement)
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
    return new ErrorHandlingUseCaseDecorator(
      new AddCommentUseCaseWithValidation(
        new AddCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService),
        this.userGatewayForPostManagement,
        this.commentAuthorizationService,
        this.postReadRepository,
        this.commentWriteRepository
      )
    )
  }

  createEditCommentUseCase(): IEditCommentUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new EditCommentUseCaseWithValidation(
        new EditCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService),
        this.userGatewayForPostManagement,
        this.commentWriteRepository,
        this.commentAuthorizationService
      )
    )
  }

  createSoftDeleteCommentUseCase(): ISoftDeleteCommentUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new SoftDeleteCommentUseCaseWithValidation(
        new SoftDeleteCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService),
        this.userGatewayForPostManagement,
        this.commentWriteRepository,
        this.commentAuthorizationService
      )
    )
  }

  createHardDeleteCommentUseCase(): IHardDeleteCommentUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new HardDeleteCommentUseCaseWithValidation(
        new HardDeleteCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService),
        this.userGatewayForPostManagement,
        this.commentWriteRepository,
        this.commentAuthorizationService
      )
    )
  }

  // tag
  createFindAllTagsUseCase(): IFindAllTagsUseCase {
    return new ErrorHandlingUseCaseDecorator(
      new FindAllTagsUseCaseWithValidation(new FindAllTagsUseCase(this.tagRepository, this.tagApplicationMapper))
    )
  }
}
