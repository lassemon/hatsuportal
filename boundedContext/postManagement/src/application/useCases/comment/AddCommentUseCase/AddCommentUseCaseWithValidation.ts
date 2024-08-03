import { UseCaseWithValidation, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IAddCommentUseCase, IAddCommentUseCaseOptions } from './AddCommentUseCase'
import { IPostReadRepository } from '../../../read/IPostReadRepository'
import { CommentId, ICommentWriteRepository, PostId } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { AddCommentTargetKind, isReply } from '../../../dtos'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('AddCommentUseCaseWithValidation')

export class AddCommentUseCaseWithValidation extends UseCaseWithValidation<IAddCommentUseCaseOptions> implements IAddCommentUseCase {
  constructor(
    private readonly useCase: IAddCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly authorizationService: IPostAuthorizationService,
    private readonly postRepository: IPostReadRepository,
    private readonly commentRepository: ICommentWriteRepository
  ) {
    super(logger)
  }

  async execute(options: IAddCommentUseCaseOptions): Promise<void> {
    this.logger.debug('Validating AddCommentUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadUserResult = await this.userGateway.getUserById({ userId: options.addCommentInput.authorId })
    if (!loadUserResult.isSuccess()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    const valid = (await this.validateAuthorization(loggedInUser, options)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO, options: IAddCommentUseCaseOptions): Promise<boolean> {
    const postId = new PostId(options.addCommentInput.postId)
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new AuthorizationError(`Post with id ${postId.value} does not exist.`)
    }

    if (isReply(options.addCommentInput.target)) {
      const parentCommentId = new CommentId(options.addCommentInput.target.parentCommentId)
      const parentComment = await this.commentRepository.findByIdForUpdate(parentCommentId)
      const authorizationResult = this.authorizationService.canAddReply(loggedInUser, post, parentComment)
      if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)
    } else {
      const authorizationResult = this.authorizationService.canAddComment(loggedInUser, post)
      if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)
    }

    return true
  }

  private validateDomainRules(options: IAddCommentUseCaseOptions): boolean {
    return (
      this.testArgumentInstance(PostId, 'addCommentInput.postId', options) &&
      this.testArgumentInstance(NonEmptyString, 'addCommentInput.authorId', options) &&
      this.testArgumentInstance(NonEmptyString, 'addCommentInput.body', options) &&
      this.testEnumArgument(AddCommentTargetKind, 'addCommentInput.target.kind', options) &&
      (options.addCommentInput.target.kind === AddCommentTargetKind.TopLevel
        ? this.testArgumentInstance(PostId, 'addCommentInput.target.postId', options)
        : this.testArgumentInstance(CommentId, 'addCommentInput.target.parentCommentId', options))
    )
  }
}
