import { vi } from 'vitest'
import { IUpdateImageUseCase, IUpdateImageUseCaseOptions, UpdateImageUseCaseWithValidation } from '../../application'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class UpdateImageValidationScenario extends ImageValidationScenarioBase<
  IUpdateImageUseCaseOptions,
  'imageUpdated' | 'updateConflict'
> {
  private readonly innerUseCaseMock: IUpdateImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  static given() {
    return new UpdateImageValidationScenario()
  }

  private constructor() {
    super(['imageUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: IUpdateImageUseCaseOptions) {
    const wrapped = new UpdateImageUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.mediaAuthorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        updatedById: input.updatedById,
        updateImageInput: input.updateImageInput,
        imageUpdated: this.spyOutputBoundary('imageUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
