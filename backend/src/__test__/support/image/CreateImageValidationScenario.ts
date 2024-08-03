import { vi } from 'vitest'
import { CreateImageUseCaseWithValidation } from '../../../application/useCases/image/CreateImageUseCase/CreateImageUseCaseWithValidation'
import { IUserRepository } from '@hatsuportal/user-management'
import { ICreateImageUseCase, CreateImageInputDTO } from '@hatsuportal/common-bounded-context'
import { UserValidationScenarioBase } from '../user/UserValidationScenarioBase'

export class CreateImageValidationScenario extends UserValidationScenarioBase<CreateImageInputDTO, 'imageCreated'> {
  static given() {
    return new CreateImageValidationScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  private readonly innerUseCaseMock: ICreateImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: CreateImageInputDTO) {
    const wrapped = new CreateImageUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository as unknown as IUserRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        createImageInput: input,
        imageCreated: this.spyOutputBoundary('imageCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
