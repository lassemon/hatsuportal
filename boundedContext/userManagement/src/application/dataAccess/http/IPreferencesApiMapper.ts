import { PreferencesResponse, UpdatePreferencesRequest } from '@hatsuportal/contracts'
import { PreferencesDTO, UpdateUserPreferencesInputDTO } from '../../dtos'

export interface IPreferencesApiMapper {
  toResponse(preferences: PreferencesDTO): PreferencesResponse
  toUpdateUserPreferencesInputDTO(updatePreferencesRequest: UpdatePreferencesRequest): UpdateUserPreferencesInputDTO
}
