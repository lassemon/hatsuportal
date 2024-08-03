import { DomainError } from '../../domain'
import { ApplicationError } from '../errors/ApplicationError'
import { IUseCase, IUseCaseOptions } from './IUseCase'

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
