import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IEditCommentUseCase, IEditCommentUseCaseOptions } from './EditCommentUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { Comment, CommentId, ICommentWriteRepository } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'

const logger = new Logger('EditCommentUseCaseWithValidation')

export class EditCommentUseCaseWithValidation extends UseCaseWithValidation<IEditCommentUseCaseOptions> implements IEditCommentUseCase {
  constructor(
    private readonly useCase: IEditCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly commentRepository: ICommentWriteRepository,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IEditCommentUseCaseOptions): Promise<void> {
    this.logger.debug('Validating EditCommentUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadUserResult = await this.userGateway.getUserById({ userId: options.editCommentInput.authorId })
    if (!loadUserResult.isSuccess()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    if (!loggedInUser) throw new AuthorizationError('Not logged in.')

    const existingComment = await this.commentRepository.findByIdForUpdate(new CommentId(options.editCommentInput.commentId))

    if (!existingComment)
      throw new NotFoundError(`Cannot edit comment with id ${options.editCommentInput.commentId} because it does not exist.`)

    const valid = (await this.validateAuthorization(loggedInUser, existingComment)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingComment: Comment): boolean {
    const authorizationResult = this.authorizationService.canEditComment(loggedInUser, existingComment)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IEditCommentUseCaseOptions): boolean {
    return (
      this.testArgumentInstance(CommentId, 'editCommentInput.commentId', options) &&
      this.testArgumentInstance(NonEmptyString, 'editCommentInput.authorId', options)
    )
  }
}
