import { ICreateStagedImageVersionUseCaseOptions, CreateStagedImageVersionUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'

export class CreateStagedImageVersionScenario extends ImageScenarioBase<ICreateStagedImageVersionUseCaseOptions, 'imageCreated'> {
  static given() {
    return new CreateStagedImageVersionScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  async whenExecutedWithInput(input: ICreateStagedImageVersionUseCaseOptions) {
    const useCase = new CreateStagedImageVersionUseCase(this.imagePersistenceService, this.storageKeyGenerator)

    await this.capture(() =>
      useCase.execute({
        createdById: input.createdById,
        createImageInput: input.createImageInput,
        imageCreated: this.spyOutputBoundary('imageCreated')
      })
    )

    return this
  }
}
