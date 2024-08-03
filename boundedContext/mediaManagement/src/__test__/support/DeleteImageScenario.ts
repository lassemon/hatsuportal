import { IDeleteImageUseCaseOptions, DeleteImageUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'

export class DeleteImageScenario extends ImageScenarioBase<IDeleteImageUseCaseOptions, 'imageDeleted'> {
  static given() {
    return new DeleteImageScenario()
  }

  private constructor() {
    super(['imageDeleted'])
  }

  async whenExecutedWithInput(input: IDeleteImageUseCaseOptions) {
    const useCase = new DeleteImageUseCase(this.imageLookupService, this.imagePersistenceService, this.domainEventService, this.imageMapper)

    await this.capture(() =>
      useCase.execute({
        deletedById: input.deletedById,
        deleteImageInput: input.deleteImageInput,
        imageDeleted: this.spyOutputBoundary('imageDeleted')
      })
    )

    return this
  }
}
