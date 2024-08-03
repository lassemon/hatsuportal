import { UseCaseWithValidation } from '@hatsuportal/platform'
import { OrderEnum, Logger } from '@hatsuportal/common'
import { IGetCommentsUseCase, IGetCommentsUseCaseOptions } from './GetCommentsUseCase'
import { CommentCursor, PostId } from '../../../../domain'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

const logger = new Logger('GetCommentsUseCaseWithValidation')

export class GetCommentsUseCaseWithValidation extends UseCaseWithValidation<IGetCommentsUseCaseOptions> implements IGetCommentsUseCase {
  constructor(private readonly useCase: IGetCommentsUseCase) {
    super(logger)
  }

  async execute(options: IGetCommentsUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetCommentsUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    if (domainRulesValid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IGetCommentsUseCaseOptions): boolean {
    return (
      this.testArgumentInstance(PostId, 'getCommentsInput.postId', options) &&
      this.testArgumentInstance(NonNegativeInteger, 'getCommentsInput.limit', options) &&
      this.testEnumArgument(OrderEnum, 'getCommentsInput.sort', options) &&
      (options.getCommentsInput.cursor ? this.testArgumentInstance(CommentCursor, 'getCommentsInput.cursor', options) : true)
    )
  }
}
