import { IAuthHttpClient, IAuthService, IUserViewModelMapper } from 'application/interfaces'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'

export class AuthService implements IAuthService {
  constructor(private readonly authHttpClient: IAuthHttpClient, private readonly userViewModelMapper: IUserViewModelMapper) {}

  public async login(loginPayload: { username: string; password: string }): Promise<UserViewModel> {
    const response = await this.authHttpClient.login(loginPayload)
    return this.userViewModelMapper.toViewModel(response)
  }

  public async logout(): Promise<void> {
    return await this.authHttpClient.logout()
  }

  public async status(): Promise<UserViewModel> {
    const response = await this.authHttpClient.status()
    return this.userViewModelMapper.toViewModel(response)
  }
}
