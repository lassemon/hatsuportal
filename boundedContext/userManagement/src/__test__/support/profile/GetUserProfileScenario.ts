import { EntityLoadResult } from '@hatsuportal/platform'
import { ScenarioBase } from '../ScenarioBase'
import { User } from '../../../domain'
import { GetUserProfileUseCase } from '../../../application/useCases/profile/GetUserProfileUseCase'
import { vi } from 'vitest'

export class GetUserProfileScenario extends ScenarioBase<User, 'userProfile', {}> {
  static given() {
    return new GetUserProfileScenario()
  }

  private constructor() {
    super(['userProfile'], {} as Record<string, never>)
  }

  postGatewayWillFail(error: Error) {
    vi.mocked(this.postGateway.getStoriesByCreatorId).mockImplementation((creatorId: string) =>
      Promise.resolve(EntityLoadResult.failedToLoad(creatorId, error))
    )
    return this
  }

  async whenExecutedWithInput(user: User) {
    const useCase = new GetUserProfileUseCase(this.postGateway)

    await this.capture(() =>
      useCase.execute({
        user,
        userProfile: this.spyOutputBoundary('userProfile')
      })
    )

    return this
  }
}
