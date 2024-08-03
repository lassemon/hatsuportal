import { ScenarioBase } from '../ScenarioBase'
import { User } from '../../../domain'
import { GetUserProfileUseCase } from '../../../application/useCases/profile/GetUserProfileUseCase'
import { UserApplicationMapper } from '../../../application'

export class GetUserProfileScenario extends ScenarioBase<User, 'userProfile', {}> {
  static given() {
    return new GetUserProfileScenario()
  }

  private readonly userApplicationMapper = new UserApplicationMapper()

  private constructor() {
    super(['userProfile'], {} as Record<string, never>)
  }

  async whenExecutedWithInput(user: User) {
    const useCase = new GetUserProfileUseCase(this.userReadRepository, this.userApplicationMapper)

    await this.capture(() =>
      useCase.execute({
        loggedInUserId: user.id.value,
        userId: user.id.toString(),
        userProfile: this.spyOutputBoundary('userProfile')
      })
    )

    return this
  }
}
