import { IUseCase, IUseCaseOptions } from '../useCases/IUseCase'
import ApplicationError from '../errors/ApplicationError'
import { DomainError } from '@hatsuportal/shared-kernel'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('ErrorHandlingUseCaseDecorator')

export class ErrorHandlingUseCaseDecorator<TOptions extends IUseCaseOptions> implements IUseCase<TOptions> {
  constructor(private readonly inner: IUseCase<TOptions>) {}

  async execute(input: TOptions): Promise<void> {
    try {
      return await this.inner.execute(input)
    } catch (error) {
      if (error instanceof DomainError || error instanceof ApplicationError) {
        throw error // pass through
      }
      if (error instanceof Error) {
        logger.warn(error.stack)
        throw new ApplicationError({
          message: error.message,
          cause: error
        })
      }
      throw new ApplicationError({
        message: 'Unknown error',
        cause: error
      })
    }
  }
}
