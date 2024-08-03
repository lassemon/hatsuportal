import { UserScenarioBase } from './UserScenarioBase'
import { CreateUserUseCase } from '../../../application/useCases/user/CreateUserUseCase/CreateUserUseCase'
import { CreateUserInputDTO } from '@hatsuportal/user-management'

export class CreateUserScenario extends UserScenarioBase<CreateUserInputDTO, 'userCreated'> {
  static given() {
    return new CreateUserScenario()
  }

  private constructor() {
    super(['userCreated'])
  }

  async whenExecutedWithInput(input: CreateUserInputDTO) {
    const useCase = new CreateUserUseCase(this.userRepository, this.userMapper, this.transactionBundle.transactionManagerMock)

    await this.capture(() =>
      useCase.execute({
        createUserInput: input,
        userCreated: this.spyOutputBoundary('userCreated')
      })
    )

    return this
  }
}
