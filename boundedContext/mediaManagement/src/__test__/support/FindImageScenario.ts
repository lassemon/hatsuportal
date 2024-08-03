import { FindImageUseCase } from '../../application/useCases/FindImageUseCase/FindImageUseCase'
import { ImageScenarioBase } from './ImageScenarioBase'
import { vi } from 'vitest'

export class FindImageScenario extends ImageScenarioBase<string, 'imageFound'> {
  private readonly fileServiceMock = {
    getImageFromFileSystem: vi.fn().mockResolvedValue('data:image/png;base64,AAA')
  }

  static given() {
    return new FindImageScenario()
  }

  private constructor() {
    super(['imageFound'])
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  fileServiceWillFail(error = new Error('fs fail')) {
    this.fileServiceMock.getImageFromFileSystem = vi.fn().mockRejectedValue(error)
    return this
  }

  async whenExecutedWithInput(imageId: string) {
    const useCase = new FindImageUseCase(this.imageRepository, this.imageMapper, this.userGateway)

    await this.capture(() =>
      useCase.execute({
        imageId,
        imageFound: this.spyOutputBoundary('imageFound')
      })
    )

    return this
  }
}
