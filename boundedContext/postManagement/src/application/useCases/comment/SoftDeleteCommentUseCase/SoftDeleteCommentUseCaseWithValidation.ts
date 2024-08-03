import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { ISoftDeleteCommentUseCase, ISoftDeleteCommentUseCaseOptions } from './SoftDeleteCommentUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('SoftDeleteCommentUseCaseWithValidation')

export class SoftDeleteCommentUseCaseWithValidation
  extends UseCaseWithValidation<ISoftDeleteCommentUseCaseOptions>
  implements ISoftDeleteCommentUseCase
{
  constructor(
    private readonly useCase: ISoftDeleteCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly commentRepository: ICommentWriteRepository,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ISoftDeleteCommentUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SoftDeleteCommentUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadUserResult = await this.userGateway.getUserById({ userId: options.deleteCommentInput.authorId })
    if (loadUserResult.isFailed()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    const existingComment = await this.commentRepository.findByIdForUpdate(new CommentId(options.deleteCommentInput.commentId))
    if (!existingComment)
      throw new NotFoundError(`Cannot soft delete comment with id ${options.deleteCommentInput.commentId} because it does not exist.`)

    const valid = (await this.validateAuthorization(loggedInUser, existingComment)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO, existingComment: Comment): Promise<boolean> {
    const authorizationResult = this.authorizationService.canSoftDeleteComment(loggedInUser, existingComment)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ISoftDeleteCommentUseCaseOptions): boolean {
    this.testArgumentInstance(CommentId, 'deleteCommentInput.commentId', options)
    this.testArgumentInstance(NonEmptyString, 'deleteCommentInput.authorId', options)

    return true
  }
}
