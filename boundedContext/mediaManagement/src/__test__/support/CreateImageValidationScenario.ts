import { vi } from 'vitest'
import { ICreateImageUseCase, ICreateImageUseCaseOptions } from '../../application'
import { CreateImageUseCaseWithValidation } from '../../application/useCases/CreateImageUseCase/CreateImageUseCaseWithValidation'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class CreateImageValidationScenario extends ImageValidationScenarioBase<ICreateImageUseCaseOptions, 'imageCreated'> {
  static given() {
    return new CreateImageValidationScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  private readonly innerUseCaseMock: ICreateImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: ICreateImageUseCaseOptions) {
    const wrapped = new CreateImageUseCaseWithValidation(this.innerUseCaseMock, this.userGateway, this.mediaAuthorizationService)

    await this.capture(() =>
      wrapped.execute({
        createdById: input.createdById,
        createImageInput: input.createImageInput,
        imageCreated: this.spyOutputBoundary('imageCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
