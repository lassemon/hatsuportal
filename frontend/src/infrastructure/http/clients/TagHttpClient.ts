import { ITagHttpClient } from 'application/interfaces'
import { FetchOptions, TagListResponse } from '@hatsuportal/contracts'
import { IHttpClient } from 'application/interfaces'

export class TagHttpClient implements ITagHttpClient {
  private readonly baseUrl = '/tags'
  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(options?: FetchOptions): Promise<TagListResponse> {
    return await this.httpClient.getJson<TagListResponse>({ endpoint: `${this.baseUrl}`, ...options })
  }
}
