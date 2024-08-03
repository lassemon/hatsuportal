import { ImageScenarioBase } from './ImageScenarioBase'
import { FindImageUseCase } from '../../../application/useCases/image/FindImageUseCase/FindImageUseCase'
import * as Fixture from '../../testFactory'
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

  withExistingImage(image = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(image)
    return this
  }

  withoutExistingImage() {
    this.imageRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  fileServiceWillFail(error = new Error('fs fail')) {
    this.fileServiceMock.getImageFromFileSystem = vi.fn().mockRejectedValue(error)
    return this
  }

  async whenExecutedWithInput(imageId: string) {
    const useCase = new FindImageUseCase(this.imageRepository, this.fileServiceMock as any, this.imageMapper)

    await this.capture(() =>
      useCase.execute({
        imageId,
        imageFound: this.spyOutputBoundary('imageFound')
      })
    )

    return this
  }
}
