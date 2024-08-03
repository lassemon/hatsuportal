import { IPromoteImageVersionUseCaseOptions, PromoteImageVersionUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'
import * as Fixture from '../testFactory'
import { ImageVersionId, ImageStorageKey } from '../../domain'

export class PromoteImageVersionScenario extends ImageScenarioBase<IPromoteImageVersionUseCaseOptions, 'imagePromoted'> {
  static given() {
    return new PromoteImageVersionScenario()
  }

  private constructor() {
    super(['imagePromoted'])
  }

  async whenExecutedWithInput(input: IPromoteImageVersionUseCaseOptions) {
    const useCase = new PromoteImageVersionUseCase(
      this.imageRepository,
      this.imageMapper,
      this.transactionManager,
      this.storageKeyGenerator
    )

    await this.capture(() =>
      useCase.execute({
        promotedById: input.promotedById,
        imageId: input.imageId,
        stagedVersionId: input.stagedVersionId,
        imagePromoted: this.spyOutputBoundary('imagePromoted')
      })
    )

    return this
  }

  withStagedImage() {
    return this.withExistingImage(Fixture.imageWithCurrentAndStagedVersionMock())
  }

  withStagedImageOnly() {
    const imageWithStagedOnly = Fixture.imageMock(
      { currentVersionId: new ImageVersionId(Fixture.sampleImageVersionId) },
      {
        id: new ImageVersionId(Fixture.sampleImageVersionId),
        isStaged: true,
        isCurrent: false,
        storageKey: ImageStorageKey.fromString(Fixture.sampleStagedImageStorageKeyWithVersionId)
      }
    )
    return this.withExistingImage(imageWithStagedOnly)
  }
}
