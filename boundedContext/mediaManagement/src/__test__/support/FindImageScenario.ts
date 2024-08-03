import { FindImageUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'

export class FindImageScenario extends ImageScenarioBase<string, 'imageFound'> {
  static given() {
    return new FindImageScenario()
  }

  private constructor() {
    super(['imageFound'])
  }

  async whenExecutedWithInput(imageId: string) {
    const useCase = new FindImageUseCase(this.imageLookupService, this.imageMapper, this.userGateway)

    await this.capture(() =>
      useCase.execute({
        imageId,
        imageFound: this.spyOutputBoundary('imageFound')
      })
    )

    return this
  }
}
