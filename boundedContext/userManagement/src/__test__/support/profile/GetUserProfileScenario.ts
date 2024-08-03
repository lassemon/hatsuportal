//(import { vi } from 'vitest'
import { ScenarioBase } from '../ScenarioBase'
import { User } from '../../../domain'
//import * as Fixture from '../../testFactory'
import { GetUserProfileUseCase } from '../../../application/useCases/profile/GetUserProfileUseCase'

export class GetUserProfileScenario extends ScenarioBase<User, 'userProfile', {}> {
  //protected readonly storyRepository = Fixture.storyReadRepositoryMock()

  static given() {
    return new GetUserProfileScenario()
  }

  private constructor() {
    super(['userProfile'], {} as any)
  }

  repositoryWillReject(error = new Error('repo failure')) {
    //this.storyRepository.countStoriesByCreator = vi.fn().mockRejectedValue(error)
    return this
  }

  async whenExecutedWithInput(user: User) {
    const useCase = new GetUserProfileUseCase(/*this.storyRepository*/)

    await this.capture(() =>
      useCase.execute({
        user,
        userProfile: this.spyOutputBoundary('userProfile')
      })
    )

    return this
  }
}
