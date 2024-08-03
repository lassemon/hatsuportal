import { ThemeResponse } from '@hatsuportal/contracts'
import { ThemeViewModel, ThemeViewModelDTO } from 'ui/entities/user/model/ThemeViewModel'
import { IThemeViewModelMapper } from 'application/interfaces'

export class ThemeViewModelMapper implements IThemeViewModelMapper {
  toDTO(response: ThemeResponse): ThemeViewModelDTO {
    return {
      id: response.id,
      name: response.name,
      lightColors: {
        primary: response.lightColors.primary,
        backgroundPrimary: response.lightColors.backgroundPrimary,
        backgroundSecondary: response.lightColors.backgroundSecondary,
        callToAction: response.lightColors.callToAction
      },
      darkColors: {
        primary: response.darkColors.primary,
        backgroundPrimary: response.darkColors.backgroundPrimary,
        backgroundSecondary: response.darkColors.backgroundSecondary,
        callToAction: response.darkColors.callToAction
      },
      createdById: response.createdById,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    }
  }

  toViewModel(themeResponse: ThemeResponse): ThemeViewModel {
    return new ThemeViewModel(this.toDTO(themeResponse))
  }
}
