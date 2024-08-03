import { FetchOptions, TagListResponse } from '@hatsuportal/contracts'

export interface ITagHttpClient {
  findAll(options?: FetchOptions): Promise<TagListResponse>
}
