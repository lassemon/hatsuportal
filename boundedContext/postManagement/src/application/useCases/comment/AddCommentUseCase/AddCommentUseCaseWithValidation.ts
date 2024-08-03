import { UseCaseWithValidation, AuthorizationError, NotFoundError, AuthenticationError, InvalidInputError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { IAddCommentUseCase, IAddCommentUseCaseOptions } from './AddCommentUseCase'
import { IPostReadRepository } from '../../../read/IPostReadRepository'
import { CommentBody, CommentId, PostId } from '../../../../domain'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { AddCommentTargetKind, isReply } from '../../../dtos'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { ICommentAuthorizationService } from '../../../authorization/services/CommentAuthorizationService'
import { ICommentReadRepository } from '../../../read/ICommentReadRepository'

const logger = new Logger('AddCommentUseCaseWithValidation')

export class AddCommentUseCaseWithValidation extends UseCaseWithValidation<IAddCommentUseCaseOptions> implements IAddCommentUseCase {
  constructor(
    private readonly useCase: IAddCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly authorizationService: ICommentAuthorizationService,
    private readonly postRepository: IPostReadRepository,
    private readonly commentRepository: ICommentReadRepository
  ) {
    super(logger)
  }

  async execute(options: IAddCommentUseCaseOptions): Promise<void> {
    this.logger.debug('Validating AddCommentUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadUserResult = await this.userGateway.getUserById({ userId: options.addCommentInput.authorId })
    if (!loadUserResult.isSuccess()) throw new AuthenticationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    const valid = (await this.validateAuthorization(loggedInUser, options)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO, options: IAddCommentUseCaseOptions): Promise<boolean> {
    const postId = new PostId(options.addCommentInput.postId)
    const post = await this.postRepository.findById(postId)

    if (!post) {
      throw new NotFoundError(`Post with id ${postId.value} does not exist.`)
    }

    if (isReply(options.addCommentInput.target)) {
      const parentCommentId = new CommentId(options.addCommentInput.target.parentCommentId)
      const parentComment = await this.commentRepository.getById(parentCommentId)
      if (!parentComment) {
        throw new NotFoundError(`Parent comment with id ${parentCommentId.value} does not exist.`)
      }

      if (parentComment.isDeleted) {
        throw new NotFoundError(`Parent comment with id ${parentCommentId.value} does not exist.`)
      }
      if (parentComment.postId !== postId.value) {
        throw new InvalidInputError(
          `Trying to reply to parentCommentId '${parentCommentId.value}' but parent comment does not belong to the same postId '${postId.value}' that we are trying to reply to. Parent comment instead belongs to postId '${parentComment.postId}'.`
        )
      }
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
      this.testArgumentInstance(CommentBody, 'addCommentInput.body', options) &&
      this.testEnumArgument(AddCommentTargetKind, 'addCommentInput.target.kind', options) &&
      (options.addCommentInput.target.kind === AddCommentTargetKind.TopLevel
        ? this.testArgumentInstance(PostId, 'addCommentInput.target.postId', options)
        : this.testArgumentInstance(CommentId, 'addCommentInput.target.parentCommentId', options))
    )
  }
}
