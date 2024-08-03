import { IAuthHttpClient, IImageHttpClient, IProfileHttpClient, IStoryHttpClient, IUserHttpClient } from 'application'

export interface IHttpClientFactory {
  createAuthHttpClient(): IAuthHttpClient
  createUserHttpClient(): IUserHttpClient
  createStoryHttpClient(): IStoryHttpClient
  createImageHttpClient(): IImageHttpClient
  createProfileHttpClient(): IProfileHttpClient
}
