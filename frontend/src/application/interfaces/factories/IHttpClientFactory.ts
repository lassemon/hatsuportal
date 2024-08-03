import { IAuthHttpClient, IImageHttpClient, IProfileHttpClient, IStoryHttpClient, IUserHttpClient } from 'application/interfaces'

export interface IHttpClientFactory {
  createAuthHttpClient(): IAuthHttpClient
  createUserHttpClient(): IUserHttpClient
  createStoryHttpClient(): IStoryHttpClient
  createImageHttpClient(): IImageHttpClient
  createProfileHttpClient(): IProfileHttpClient
}
