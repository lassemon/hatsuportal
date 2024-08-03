import { FetchOptions } from '@hatsuportal/contracts'

export interface RequestInit<Payload> extends FetchOptions {
  payload?: Payload
  endpoint: string
  querystring?: string
  noRefresh?: boolean
}

export interface IHttpClient {
  getJson<Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response>
  patchJson<Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response>
  postJson<Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response>
  deleteJson<Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response>
}
