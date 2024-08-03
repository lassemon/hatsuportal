import { vi } from 'vitest'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'
import { FindImageUseCaseWithValidation } from '../../application/useCases/FindImageUseCase/FindImageUseCaseWithValidation'
import { IFindImageUseCase } from '../../application'

export class FindImageValidationScenario extends ImageValidationScenarioBase<string, 'imageFound'> {
  private readonly innerUseCaseMock: IFindImageUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  static given() {
    return new FindImageValidationScenario()
  }

  private constructor() {
    super(['imageFound'])
  }

  async whenExecutedWithInput(imageId: string) {
    const wrapped = new FindImageUseCaseWithValidation(this.innerUseCaseMock)

    await this.capture(() =>
      wrapped.execute({
        imageId,
        imageFound: this.spyOutputBoundary('imageFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
