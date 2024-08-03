import { IUnitOfWork, IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IThemeRepository, Theme, ThemeColors, ThemeId, ThemeName, UserId } from '../../../../domain'
import { CreateThemeInputDTO, ThemeDTO } from '../../../dtos'
import { IThemeApplicationMapper } from '../../../mappers/ThemeApplicationMapper'

export interface ICreateThemeUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createThemeInput: CreateThemeInputDTO
  themeCreated: (theme: ThemeDTO) => void
}

export type ICreateThemeUseCase = IUseCase<ICreateThemeUseCaseOptions>

export class CreateThemeUseCase implements ICreateThemeUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ createdById, createThemeInput, themeCreated }: ICreateThemeUseCaseOptions): Promise<void> {
    const [savedTheme] = await this.unitOfWork.execute<[Theme]>(async () => {
      const now = unixtimeNow()
      const theme = Theme.create({
        id: new ThemeId(uuid()),
        name: new ThemeName(createThemeInput.name),
        lightColors: ThemeColors.reconstruct(createThemeInput.lightColors),
        darkColors: ThemeColors.reconstruct(createThemeInput.darkColors),
        createdById: new UserId(createdById),
        createdAt: new CreatedAtTimestamp(now),
        updatedAt: new UnixTimestamp(now)
      })
      await this.themeRepository.insert(theme)
      return [theme]
    })

    themeCreated(this.themeApplicationMapper.toDTO(savedTheme))
  }
}
