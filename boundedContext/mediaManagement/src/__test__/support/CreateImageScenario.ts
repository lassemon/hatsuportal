import { ICreateImageUseCaseOptions } from '../../application'
import { CreateImageUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'

export class CreateImageScenario extends ImageScenarioBase<ICreateImageUseCaseOptions, 'imageCreated'> {
  static given() {
    return new CreateImageScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  async whenExecutedWithInput(input: ICreateImageUseCaseOptions) {
    const useCase = new CreateImageUseCase(
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.storageKeyGenerator,
      this.transactionManager
    )

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
