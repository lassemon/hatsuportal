import { ICreateStagedImageVersionUseCaseOptions, CreateStagedImageVersionUseCase } from '../../application'
import { StagedImageFactory } from '../../application/factories/StagedImageFactory'
import { ImageScenarioBase } from './ImageScenarioBase'

export class CreateStagedImageVersionScenario extends ImageScenarioBase<ICreateStagedImageVersionUseCaseOptions, 'imageCreated'> {
  static given() {
    return new CreateStagedImageVersionScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  async whenExecutedWithInput(input: ICreateStagedImageVersionUseCaseOptions) {
    const stagedImageFactory = new StagedImageFactory(this.storageKeyGenerator)
    const useCase = new CreateStagedImageVersionUseCase(this.imagePersistenceService, stagedImageFactory, this.unitOfWork)

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
