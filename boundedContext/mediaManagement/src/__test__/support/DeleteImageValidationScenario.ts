import { vi } from 'vitest'
import {
  IDeleteImageUseCase,
  IDeleteImageUseCaseOptions,
  DeleteImageUseCaseWithValidation
} from '../../application'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class DeleteImageValidationScenario extends ImageValidationScenarioBase<
  IDeleteImageUseCaseOptions,
  'imageDeleted'
> {
  static given() {
    return new DeleteImageValidationScenario()
  }

  private constructor() {
    super(['imageDeleted'])
  }

  private readonly innerUseCaseMock: IDeleteImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: IDeleteImageUseCaseOptions) {
    const wrapped = new DeleteImageUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.mediaAuthorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deletedById: input.deletedById,
        deleteImageInput: input.deleteImageInput,
        imageDeleted: this.spyOutputBoundary('imageDeleted')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
