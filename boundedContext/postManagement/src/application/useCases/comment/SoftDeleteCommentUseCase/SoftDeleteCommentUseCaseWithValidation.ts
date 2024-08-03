import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { ISoftDeleteCommentUseCase, ISoftDeleteCommentUseCaseOptions } from './SoftDeleteCommentUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { CommentId } from '../../../../domain'
import { ICommentAuthorizationService } from '../../../authorization/services/CommentAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { ICommentReadRepository } from '../../../read/ICommentReadRepository'
import { CommentDTO } from '../../../dtos'

const logger = new Logger('SoftDeleteCommentUseCaseWithValidation')

export class SoftDeleteCommentUseCaseWithValidation
  extends UseCaseWithValidation<ISoftDeleteCommentUseCaseOptions>
  implements ISoftDeleteCommentUseCase
{
  constructor(
    private readonly useCase: ISoftDeleteCommentUseCase,
    private readonly userGateway: IUserGateway,
    private readonly commentReadRepository: ICommentReadRepository,
    private readonly authorizationService: ICommentAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ISoftDeleteCommentUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SoftDeleteCommentUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const loadUserResult = await this.userGateway.getUserById({ userId: options.deleteCommentInput.authorId })
    if (loadUserResult.isFailed()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    let existingComment: CommentDTO
    try {
      existingComment = await this.commentReadRepository.getById(new CommentId(options.deleteCommentInput.commentId))
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError(`Cannot soft delete comment with id ${options.deleteCommentInput.commentId} because it does not exist.`)
      }
      throw error
    }

    const valid = (await this.validateAuthorization(loggedInUser, existingComment)) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO, existingComment: CommentDTO): Promise<boolean> {
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
