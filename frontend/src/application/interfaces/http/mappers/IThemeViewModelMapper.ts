import { ThemeResponse } from '@hatsuportal/contracts'
import { ThemeViewModel, ThemeViewModelDTO } from 'ui/entities/user/model/ThemeViewModel'

export interface IThemeViewModelMapper {
  toDTO(response: ThemeResponse): ThemeViewModelDTO
  toViewModel(response: ThemeResponse): ThemeViewModel
}
