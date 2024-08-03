import { CreateThemeRequest, ThemeResponse, UpdateThemeRequest } from '@hatsuportal/contracts'
import { CreateThemeInputDTO, ThemeDTO, UpdateThemeInputDTO } from '../../dtos'

export interface IThemeApiMapper {
  toResponse(theme: ThemeDTO): ThemeResponse
  toCreateThemeInputDTO(createThemeRequest: CreateThemeRequest): CreateThemeInputDTO
  toUpdateThemeInputDTO(updateThemeRequest: UpdateThemeRequest): UpdateThemeInputDTO
}
