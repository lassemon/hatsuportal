import { vi } from 'vitest'
import { IPromoteImageVersionUseCase, IPromoteImageVersionUseCaseOptions } from '../../application'
import { PromoteImageVersionUseCaseWithValidation } from '../../application/useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCaseWithValidation'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

export class PromoteImageVersionValidationScenario extends ImageValidationScenarioBase<
  IPromoteImageVersionUseCaseOptions,
  'imagePromoted'
> {
  static given() {
    return new PromoteImageVersionValidationScenario()
  }

  private constructor() {
    super(['imagePromoted'])
  }

  private readonly innerUseCaseMock: IPromoteImageVersionUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  async whenExecutedWithInput(input: IPromoteImageVersionUseCaseOptions) {
    const wrapped = new PromoteImageVersionUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.mediaAuthorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        promotedById: input.promotedById,
        imageId: input.imageId,
        stagedVersionId: input.stagedVersionId,
        imagePromoted: this.spyOutputBoundary('imagePromoted')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
