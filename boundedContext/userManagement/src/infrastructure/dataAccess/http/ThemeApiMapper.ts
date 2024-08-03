import { CreateThemeRequest, ThemeResponse, UpdateThemeRequest } from '@hatsuportal/contracts'
import { CreateThemeInputDTO, ThemeDTO, UpdateThemeInputDTO } from '../../../application/dtos'
import { IThemeApiMapper } from '../../../application/dataAccess/http/IThemeApiMapper'

export class ThemeApiMapper implements IThemeApiMapper {
  toResponse(theme: ThemeDTO): ThemeResponse {
    return {
      id: theme.id,
      name: theme.name,
      lightColors: theme.lightColors,
      darkColors: theme.darkColors,
      createdById: theme.createdById,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt
    }
  }

  toCreateThemeInputDTO(createThemeRequest: CreateThemeRequest): CreateThemeInputDTO {
    return {
      name: createThemeRequest.name,
      lightColors: createThemeRequest.lightColors,
      darkColors: createThemeRequest.darkColors
    }
  }

  toUpdateThemeInputDTO(updateThemeRequest: UpdateThemeRequest): UpdateThemeInputDTO {
    return {
      name: updateThemeRequest.name,
      lightColors: updateThemeRequest.lightColors,
      darkColors: updateThemeRequest.darkColors
    }
  }
}
