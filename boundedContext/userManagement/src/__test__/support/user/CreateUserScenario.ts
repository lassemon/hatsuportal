import { UserScenarioBase } from './UserScenarioBase'
import { CreateUserUseCase, ICreateUserUseCaseOptions } from '../../../application/useCases/user/CreateUserUseCase/CreateUserUseCase'

export class CreateUserScenario extends UserScenarioBase<ICreateUserUseCaseOptions, 'userCreated'> {
  static given() {
    return new CreateUserScenario()
  }

  private constructor() {
    super(['userCreated'])
  }

  async whenExecutedWithInput(input: ICreateUserUseCaseOptions) {
    const useCase = new CreateUserUseCase(this.userRepository, this.userMapper, this.transactionManager, this.passwordFactory)

    await this.capture(() =>
      useCase.execute({
        createdById: input.createdById,
        createUserInput: input.createUserInput,
        userCreated: this.spyOutputBoundary('userCreated')
      })
    )

    return this
  }
}
