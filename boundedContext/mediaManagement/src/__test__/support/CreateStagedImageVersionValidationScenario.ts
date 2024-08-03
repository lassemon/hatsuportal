import { vi } from 'vitest'
import {
  ICreateStagedImageVersionUseCase,
  ICreateStagedImageVersionUseCaseOptions,
  CreateStagedImageVersionUseCaseWithValidation
} from '../../application'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class CreateStagedImageVersionValidationScenario extends ImageValidationScenarioBase<
  ICreateStagedImageVersionUseCaseOptions,
  'imageCreated'
> {
  static given() {
    return new CreateStagedImageVersionValidationScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  private readonly innerUseCaseMock: ICreateStagedImageVersionUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: ICreateStagedImageVersionUseCaseOptions) {
    const wrapped = new CreateStagedImageVersionUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.mediaAuthorizationService
    )

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
