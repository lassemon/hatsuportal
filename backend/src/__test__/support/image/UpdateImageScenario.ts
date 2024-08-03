import { ImageScenarioBase } from './ImageScenarioBase'
import { UpdateImageUseCase } from '../../../application/useCases/image/UpdateImageUseCase/UpdateImageUseCase'
import * as Fixture from '../../testFactory'
import { vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { UpdateImageInputDTO } from '@hatsuportal/common-bounded-context'

export class UpdateImageScenario extends ImageScenarioBase<UpdateImageInputDTO, 'imageUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateImageScenario()
  }

  private constructor() {
    super(['imageUpdated', 'updateConflict'])
  }

  withExistingImage(existing = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(existing)
    this.imageRepository.update = vi.fn().mockResolvedValue(existing)
    return this
  }

  withoutExistingImage(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(admin)
    this.imageRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  async whenExecutedWithInput(input: UpdateImageInputDTO) {
    const useCase = new UpdateImageUseCase(this.imageRepository, this.imageMapper, this.transactionBundle.transactionManagerMock)

    await this.capture(() =>
      useCase.execute({
        updateImageInput: input,
        imageUpdated: this.spyOutputBoundary('imageUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }
}
