import { ImageScenarioBase } from './ImageScenarioBase'
import { CreateImageUseCase } from '../../../application/useCases/image/CreateImageUseCase/CreateImageUseCase'
import { CreateImageInputDTO } from '@hatsuportal/common-bounded-context'

export class CreateImageScenario extends ImageScenarioBase<CreateImageInputDTO, 'imageCreated'> {
  static given() {
    return new CreateImageScenario()
  }

  private constructor() {
    super(['imageCreated'])
  }

  async whenExecutedWithInput(input: CreateImageInputDTO) {
    const useCase = new CreateImageUseCase(
      this.userRepository,
      this.imageRepository,
      this.imageMapper,
      this.transactionBundle.transactionManagerMock
    )

    await this.capture(() =>
      useCase.execute({
        createImageInput: input,
        imageCreated: this.spyOutputBoundary('imageCreated')
      })
    )

    return this
  }
}
