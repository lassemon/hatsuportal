import { IUpdateImageUseCaseOptions, UpdateImageUseCase } from '../../application'
import { ImageScenarioBase } from './ImageScenarioBase'

export class UpdateImageScenario extends ImageScenarioBase<IUpdateImageUseCaseOptions, 'imageUpdated' | 'updateConflict'> {
  static given() {
    return new UpdateImageScenario()
  }

  private constructor() {
    super(['imageUpdated', 'updateConflict'])
  }

  //withoutExistingImage(admin = Fixture.userMock({ roles: [UserRoleEnum.Admin] })) {
  //  this.userRepository.findById = vi.fn().mockResolvedValue(admin)
  //  this.imageRepository.findById = vi.fn().mockResolvedValue(null)
  //  return this
  //}

  async whenExecutedWithInput(input: IUpdateImageUseCaseOptions) {
    const useCase = new UpdateImageUseCase(
      this.userGateway,
      this.imageRepository,
      this.imageMapper,
      this.storageKeyGenerator,
      this.transactionManager
    )

    await this.capture(() =>
      useCase.execute({
        updatedById: input.updatedById,
        updateImageInput: input.updateImageInput,
        imageUpdated: this.spyOutputBoundary('imageUpdated'),
        updateConflict: this.spyOutputBoundary('updateConflict')
      })
    )

    return this
  }
}
