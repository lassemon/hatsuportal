import { UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IGetRepliesUseCase, IGetRepliesUseCaseOptions } from './GetRepliesUseCase'
import { CommentCursor, CommentId } from '../../../../domain'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

const logger = new Logger('GetRepliesUseCaseWithValidation')

export class GetRepliesUseCaseWithValidation extends UseCaseWithValidation<IGetRepliesUseCaseOptions> implements IGetRepliesUseCase {
  constructor(private readonly useCase: IGetRepliesUseCase) {
    super(logger)
  }

  async execute(options: IGetRepliesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetRepliesUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    if (domainRulesValid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IGetRepliesUseCaseOptions): boolean {
    return (
      this.testArgumentInstance(CommentId, 'getRepliesInput.parentCommentId', options) &&
      this.testArgumentInstance(NonNegativeInteger, 'getRepliesInput.limit', options) &&
      (options.getRepliesInput.cursor ? this.testArgumentInstance(CommentCursor, 'getRepliesInput.cursor', options) : true)
    )
  }
}
