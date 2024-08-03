import { FindImageUseCaseWithValidation } from '../../../application/useCases/image/FindImageUseCase/FindImageUseCaseWithValidation'
import { vi } from 'vitest'
import { IFindImageUseCase } from '@hatsuportal/common-bounded-context'
import { ImageValidationScenarioBase } from './ImageValidationScenarioBase'

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
