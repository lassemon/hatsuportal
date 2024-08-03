import { IHttpClientFactory, IHttpClient, IAuthHttpClient, IUserHttpClient, IImageHttpClient, IProfileHttpClient } from 'application'
import { AuthHttpClient } from 'infrastructure/httpClients/AuthHttpClient'
import { UserHttpClient } from 'infrastructure/httpClients/UserHttpClient'
import { StoryHttpClient } from 'infrastructure/httpClients/StoryHttpClient'
import { ImageHttpClient } from 'infrastructure/httpClients/ImageHttpClient'
import { ProfileHttpClient } from 'infrastructure/httpClients/ProfileHttpClient'

export class HttpClientFactory implements IHttpClientFactory {
  constructor(private readonly httpClient: IHttpClient) {}

  createAuthHttpClient(): IAuthHttpClient {
    return new AuthHttpClient(this.httpClient)
  }

  createUserHttpClient(): IUserHttpClient {
    return new UserHttpClient(this.httpClient)
  }

  createStoryHttpClient() {
    return new StoryHttpClient(this.httpClient)
  }

  createImageHttpClient(): IImageHttpClient {
    return new ImageHttpClient(this.httpClient)
  }

  createProfileHttpClient(): IProfileHttpClient {
    return new ProfileHttpClient(this.httpClient)
  }
}
