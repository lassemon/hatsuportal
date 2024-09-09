import { FetchOptions, ProfileResponseDTO } from '@hatsuportal/application'
import { getJson } from 'infrastructure/dataAccess/http/fetch'

export interface IProfileApiService {
  getProfile: (options?: FetchOptions) => Promise<ProfileResponseDTO>
}

export default class ProfileApiService implements IProfileApiService {
  async getProfile(options?: FetchOptions): Promise<ProfileResponseDTO> {
    return await getJson<ProfileResponseDTO>({ ...{ endpoint: '/profile' }, ...options })
  }
}
