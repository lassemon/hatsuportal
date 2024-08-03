import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { IThemeApplicationMapper } from '../../../mappers/ThemeApplicationMapper'
import { IThemeRepository } from '../../../../domain'
import { ThemeDTO } from '../../../dtos/theme/ThemeDTO'

export interface IListThemesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  themesListed: (themes: ThemeDTO[]) => void
}

export type IListThemesUseCase = IUseCase<IListThemesUseCaseOptions>

export class ListThemesUseCase implements IListThemesUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper
  ) {}

  async execute({ themesListed }: IListThemesUseCaseOptions): Promise<void> {
    const themes = await this.themeRepository.findAll()
    themesListed(themes.map((theme) => this.themeApplicationMapper.toDTO(theme)))
  }
}
