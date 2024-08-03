import { vi } from 'vitest'
import { IPromoteImageVersionUseCase, IPromoteImageVersionUseCaseOptions } from '../../application'
import { PromoteImageVersionUseCaseWithValidation } from '../../application/useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCaseWithValidation'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'
import { ImageLookupService, IImageLookupService } from '../../application/services/image/ImageLookupService'
import * as Fixture from '../testFactory'

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

  private lookupServiceOverride: IImageLookupService | null = null

  async whenExecutedWithInput(input: IPromoteImageVersionUseCaseOptions) {
    const wrapped = new PromoteImageVersionUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.lookupServiceOverride ?? this.imageLookupService,
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

  withRealLookupServiceForCoverReplace() {
    const imageStorageService = Fixture.imageStorageServiceMock()
    imageStorageService.getImage.mockResolvedValue(Fixture.base64ImageStringMock())
    this.imageRepository.findByIdAndVersionId = vi.fn().mockResolvedValue({
      ...Fixture.imageMetadataDTO(),
      versionId: Fixture.sampleImageVersionId,
      currentVersionPointer: Fixture.sampleCurrentVersionId,
      isStaged: true,
      isCurrent: false,
      storageKey: Fixture.sampleStagedImageStorageKeyWithVersionId
    })
    this.lookupServiceOverride = new ImageLookupService(this.imageRepository, imageStorageService, this.imageMapper)
    return this
  }
}
