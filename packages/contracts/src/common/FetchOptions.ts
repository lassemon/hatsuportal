export interface FetchOptions {
  signal?: AbortSignal
  headers?: { [key: string]: string }
  method?: string
}
