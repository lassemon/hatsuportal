import { PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { PreferencesDTOWithTheme, UpdateUserPreferencesInputDTO } from '../../dtos'

export interface IPreferencesApiMapper {
  toResponse(preferences: PreferencesDTOWithTheme): PreferencesResponse
  toUpdateUserPreferencesInputDTO(updatePreferencesRequest: UpdatePreferencesRequest): UpdateUserPreferencesInputDTO
}
