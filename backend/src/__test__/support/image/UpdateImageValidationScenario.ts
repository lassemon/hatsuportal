import { vi } from 'vitest'
import { IUpdateImageUseCase } from '@hatsuportal/common-bounded-context'
import { UpdateImageUseCaseWithValidation } from '../../../application/useCases/image/UpdateImageUseCase/UpdateImageUseCaseWithValidation'
import { UpdateImageInputDTO } from '@hatsuportal/common-bounded-context'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class UpdateImageValidationScenario extends ImageValidationScenarioBase<UpdateImageInputDTO, 'imageUpdated' | 'updateConflict'> {
  private readonly innerUseCaseMock: IUpdateImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  static given() {
    return new UpdateImageValidationScenario()
  }

  private constructor() {
    super(['imageUpdated', 'updateConflict'])
  }

  async whenExecutedWithInput(input: UpdateImageInputDTO) {
    const wrapped = new UpdateImageUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userRepository,
      this.imageRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        updateImageInput: input,
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
