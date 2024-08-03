import { ICreateUserUseCase, CreateUserInputDTO } from '@hatsuportal/user-management'
import { vi } from 'vitest'
import { CreateUserUseCaseWithValidation } from '../../../application/useCases/user/CreateUserUseCase/CreateUserUseCaseWithValidation'
import { UserValidationScenarioBase } from './UserValidationScenarioBase'

export class CreateUserValidationScenario extends UserValidationScenarioBase<CreateUserInputDTO, 'userCreated'> {
  static given() {
    return new CreateUserValidationScenario()
  }

  private constructor() {
    super(['userCreated'])
  }

  private readonly innerUseCaseMock: ICreateUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: CreateUserInputDTO) {
    const wrapped = new CreateUserUseCaseWithValidation(this.innerUseCaseMock, this.userRepository, this.authorizationService)

    await this.capture(() =>
      wrapped.execute({
        createUserInput: input,
        userCreated: this.spyOutputBoundary('userCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
