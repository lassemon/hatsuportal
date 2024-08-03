import { IUserPresentationMapper, UserPresentation } from '@hatsuportal/presentation-user'
import { IAuthHttpClient, IAuthService } from 'application'

export class AuthService implements IAuthService {
  constructor(private readonly authHttpClient: IAuthHttpClient, private readonly userPresentationMapper: IUserPresentationMapper) {}

  public async login(loginPayload: { username: string; password: string }): Promise<UserPresentation> {
    const response = await this.authHttpClient.login(loginPayload)
    return this.userPresentationMapper.toUserPresentation(response)
  }

  public async logout(): Promise<void> {
    return await this.authHttpClient.logout()
  }

  public async status(): Promise<UserPresentation> {
    const response = await this.authHttpClient.status()
    return this.userPresentationMapper.toUserPresentation(response)
  }
}
