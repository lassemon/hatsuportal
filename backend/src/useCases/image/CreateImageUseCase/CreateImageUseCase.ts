import { IImageApplicationMapper, ITransactionManager } from '@hatsuportal/common-bounded-context'
import { IUserRepository, UserId } from '@hatsuportal/user-management'
import { ICreateImageUseCase, ICreateImageUseCaseOptions } from '@hatsuportal/common-bounded-context'
import { IImageRepository } from '@hatsuportal/common-bounded-context'

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({ createImageInput, imageCreated }: ICreateImageUseCaseOptions): Promise<void> {
    const { loggedInUserId } = createImageInput
    const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))

    const savedImage = await this.transactionManager.execute(async () => {
      const image = this.imageMapper.createInputToDomainEntity(createImageInput, loggedInUser!.id.value, loggedInUser!.name.value)

      return await this.imageRepository.insert(image)
    }, [this.imageRepository])

    imageCreated(this.imageMapper.toDTO(savedImage))
  }
}
