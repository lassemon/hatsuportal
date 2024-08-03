import { vi } from 'vitest'
import { CreateUserUseCaseWithValidation } from '../../../application/useCases/user/CreateUserUseCase/CreateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'
import { ICreateUserUseCase, ICreateUserUseCaseOptions } from '../../../application'

export class CreateUserValidationScenario extends UserValidationScenarioBase<ICreateUserUseCaseOptions, 'userCreated'> {
  static given() {
    return new CreateUserValidationScenario()
  }

  private constructor() {
    super(['userCreated'])
  }

  private readonly innerUseCaseMock: ICreateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: ICreateUserUseCaseOptions) {
    const wrapped = new CreateUserUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.userMapper,
      this.authorizationService,
      this.passwordFactory
    )

    await this.capture(() =>
      wrapped.execute({
        createdById: input.createdById,
        createUserInput: input.createUserInput,
        userCreated: this.spyOutputBoundary('userCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
