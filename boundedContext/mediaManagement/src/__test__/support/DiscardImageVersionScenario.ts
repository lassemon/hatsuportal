import { IDiscardImageVersionUseCaseOptions, DiscardImageVersionUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'
import * as Fixture from '../testFactory'
import { ImageVersionId, ImageStorageKey } from '../../domain'

export class DiscardImageVersionScenario extends ImageScenarioBase<IDiscardImageVersionUseCaseOptions, 'imageDiscarded'> {
  static given() {
    return new DiscardImageVersionScenario()
  }

  private constructor() {
    super(['imageDiscarded'])
  }

  async whenExecutedWithInput(input: IDiscardImageVersionUseCaseOptions) {
    const useCase = new DiscardImageVersionUseCase(this.imageLookupService, this.imagePersistenceService)

    await this.capture(() =>
      useCase.execute({
        discardedById: input.discardedById,
        imageId: input.imageId,
        stagedVersionId: input.stagedVersionId,
        imageDiscarded: this.spyOutputBoundary('imageDiscarded')
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
        storageKey: ImageStorageKey.fromString(Fixture.sampleStagedImageStorageKey)
      }
    )
    return this.withExistingImage(imageWithStagedOnly)
  }
}
