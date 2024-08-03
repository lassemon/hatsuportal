import {
  IHttpClientFactory,
  IHttpClient,
  IAuthHttpClient,
  IUserHttpClient,
  IImageHttpClient,
  IProfileHttpClient,
  IStoryHttpClient,
  ITagHttpClient
} from 'application/interfaces'
import { AuthHttpClient } from 'infrastructure/http/clients/AuthHttpClient'
import { UserHttpClient } from 'infrastructure/http/clients/UserHttpClient'
import { StoryHttpClient } from 'infrastructure/http/clients/StoryHttpClient'
import { ImageHttpClient } from 'infrastructure/http/clients/ImageHttpClient'
import { ProfileHttpClient } from 'infrastructure/http/clients/ProfileHttpClient'
import { TagHttpClient } from 'infrastructure/http/clients/TagHttpClient'

export class HttpClientFactory implements IHttpClientFactory {
  constructor(private readonly httpClient: IHttpClient) {}

  createAuthHttpClient(): IAuthHttpClient {
    return new AuthHttpClient(this.httpClient)
  }

  createUserHttpClient(): IUserHttpClient {
    return new UserHttpClient(this.httpClient)
  }

  createStoryHttpClient(): IStoryHttpClient {
    return new StoryHttpClient(this.httpClient)
  }

  createImageHttpClient(): IImageHttpClient {
    return new ImageHttpClient(this.httpClient)
  }

  createProfileHttpClient(): IProfileHttpClient {
    return new ProfileHttpClient(this.httpClient)
  }

  createTagHttpClient(): ITagHttpClient {
    return new TagHttpClient(this.httpClient)
  }
}
