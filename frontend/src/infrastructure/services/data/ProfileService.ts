import { FetchOptions, IProfilePresentationMapper } from '@hatsuportal/presentation'
import { IProfileHttpClient, IProfileService } from 'application'

export class ProfileService implements IProfileService {
  constructor(
    private readonly profileHttpClient: IProfileHttpClient,
    private readonly profilePresentationMapper: IProfilePresentationMapper
  ) {}

  public async getProfile(options?: FetchOptions) {
    const response = await this.profileHttpClient.getProfile(options)
    return this.profilePresentationMapper.toProfilePresentation(response)
  }
}
