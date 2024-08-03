import { UserScenarioBase } from './UserScenarioBase'
import { FindUserUseCase, IFindUserUseCaseOptions } from '../../../application/useCases/user/FindUserUseCase/FindUserUseCase'
import * as Fixture from '../../testFactory'

export class FindUserScenario extends UserScenarioBase<IFindUserUseCaseOptions, 'userFound'> {
  static given() {
    return new FindUserScenario()
  }

  private constructor() {
    super(['userFound'])
  }

  withTargetUser(target = Fixture.userMock()) {
    this.mockFindById({ [target.id.value]: target }, target)
    return this
  }

  async whenExecutedWithInput(input: IFindUserUseCaseOptions) {
    const useCase = new FindUserUseCase(this.userReadRepository, this.userApplicationMapper)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: input.loggedInUserId,
        findUserInput: input.findUserInput,
        userFound: this.spyOutputBoundary('userFound')
      })
    )

    return this
  }
}
