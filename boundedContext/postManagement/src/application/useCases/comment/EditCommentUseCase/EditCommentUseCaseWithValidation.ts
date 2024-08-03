import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IEditCommentUseCase, IEditCommentUseCaseOptions } from './EditCommentUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { CommentId } from '../../../../domain'
import { ICommentAuthorizationService } from '../../../authorization/services/CommentAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { ICommentReadRepository } from '../../../read/ICommentReadRepository'
import { CommentDTO } from '../../../dtos'

const logger = new Logger('EditCommentUseCaseWithValidation')

export class EditCommentUseCaseWithValidation extends UseCaseWithValidation<IEditCommentUseCaseOptions> implements IEditCommentUseCase {
  constructor(
    private readonly useCase: IEditCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly commentReadRepository: ICommentReadRepository,
    private readonly authorizationService: ICommentAuthorizationService
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

    let existingComment: CommentDTO
    try {
      existingComment = await this.commentReadRepository.getById(new CommentId(options.editCommentInput.commentId))
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError(`Cannot edit comment with id ${options.editCommentInput.commentId} because it does not exist.`)
      }
      throw error
    }

    const valid = (await this.validateAuthorization(loggedInUser, existingComment)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingComment: CommentDTO): boolean {
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
