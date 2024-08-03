import { Logger } from '@hatsuportal/common'
import { ICreateUserUseCase, ICreateUserUseCaseOptions, UserName } from '@hatsuportal/user-management'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'

const logger = new Logger('CreateUserUseCaseWithValidation')

export class CreateUserUseCaseWithValidation extends UseCaseWithValidation<ICreateUserUseCaseOptions> implements ICreateUserUseCase {
  constructor(private readonly useCase: ICreateUserUseCase) {
    super(logger)
  }

  async execute(options: ICreateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateUserUseCase arguments')

    // TODO validate rest of createUserRequest
    const valid = this.testArgumentInstance(UserName, 'createUserRequest.name', options)

    if (valid) await this.useCase.execute(options)
  }
}
