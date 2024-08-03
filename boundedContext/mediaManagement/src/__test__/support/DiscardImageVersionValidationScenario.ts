import { vi } from 'vitest'
import {
  IDiscardImageVersionUseCase,
  IDiscardImageVersionUseCaseOptions,
  DiscardImageVersionUseCaseWithValidation
} from '../../application'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class DiscardImageVersionValidationScenario extends ImageValidationScenarioBase<
  IDiscardImageVersionUseCaseOptions,
  'imageDiscarded'
> {
  static given() {
    return new DiscardImageVersionValidationScenario()
  }

  private constructor() {
    super(['imageDiscarded'])
  }

  private readonly innerUseCaseMock: IDiscardImageVersionUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: IDiscardImageVersionUseCaseOptions) {
    const wrapped = new DiscardImageVersionUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.mediaAuthorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        discardedById: input.discardedById,
        imageId: input.imageId,
        stagedVersionId: input.stagedVersionId,
        imageDiscarded: this.spyOutputBoundary('imageDiscarded')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
