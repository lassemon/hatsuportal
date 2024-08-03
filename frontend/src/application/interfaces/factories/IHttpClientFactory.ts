import {
  IAuthHttpClient,
  IImageHttpClient,
  IPostHttpClient,
  IProfileHttpClient,
  IStoryHttpClient,
  ITagHttpClient,
  IUserHttpClient
} from 'application/interfaces'

export interface IHttpClientFactory {
  createAuthHttpClient(): IAuthHttpClient
  createUserHttpClient(): IUserHttpClient
  createPostHttpClient(): IPostHttpClient
  createStoryHttpClient(): IStoryHttpClient
  createImageHttpClient(): IImageHttpClient
  createProfileHttpClient(): IProfileHttpClient
  createTagHttpClient(): ITagHttpClient
}
