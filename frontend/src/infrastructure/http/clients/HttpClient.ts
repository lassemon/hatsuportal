import { HttpError } from '@hatsuportal/contracts'
import { IHttpClient, ISessionExpiredNotifier, RequestInit } from 'application/interfaces'
import { RefreshTokenError } from 'application/errors/RefreshTokenError'
import { TsoaValidationError } from 'application/errors/TsoaValidationError'

const API_ROOT = '/api/v1'
type FetchOperation<Response, Payload> = (options: RequestInit<Payload>) => Promise<Response>

export const jsonToQueryString = (url: string, json: { [key: string]: any }) => {
  const queryString = Object.keys(json)
    .reduce((urlParts: string[], key: string) => {
      const value = json[key]
      if (value == null) {
        return urlParts
      }
      // Convert arrays and objects to JSON strings and encode URI components
      let encodedValue = encodeURIComponent(value)
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          encodedValue = `${value.join(`&${key}=`)}`
        } else {
          encodedValue = JSON.stringify(value)
        }
      }
      urlParts.push(`${encodeURIComponent(key)}=${encodedValue}`)
      return urlParts
    }, [] as string[])
    .join('&')

  // Check if URL already contains a query string
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${queryString ? separator : ''}${queryString}`
}

export class HttpClient implements IHttpClient {
  constructor(private readonly sessionExpiredNotifier: ISessionExpiredNotifier) {}

  public getJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    return this.requestJson<Response, Payload>(options, 'GET', this.getJson)
  }

  public postJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    return this.requestJson<Response, Payload>(options, 'POST', this.postJson)
  }

  public patchJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    return this.requestJson<Response, Payload>(options, 'PATCH', this.patchJson)
  }

  public deleteJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    return this.requestJson<Response, Payload>(options, 'DELETE', this.deleteJson)
  }

  private requestJson = async <Response, Payload>(
    options: RequestInit<Payload>,
    method: string,
    operation: FetchOperation<Response, Payload>
  ): Promise<Response> => {
    const url = this.buildQueryUrl(options)
    const requestOptions = this.buildRequestOptions(this.buildJsonRequestOptions(options, method))
    try {
      const response = await fetch(url, requestOptions)
      return await this.handleJsonApiResponse(response)
    } catch (error) {
      return await this.refreshTokenAndRetry(error, operation, options)
    }
  }

  private buildJsonRequestOptions = <Payload>(options: RequestInit<Payload>, method: string): RequestInit<Payload> => ({
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  private handleApiResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch (error) {
        // If parsing fails, throw a generic HttpError
        throw new HttpError(response.status, response.statusText, 'Error processing response')
      }
      let message = errorData.message || response.statusText
      const status = response.status
      const statusText = response.statusText
      const context = errorData.context || {}

      if (errorData.name === 'ValidateError') {
        message += errorData?.fields?.requestBody?.message ? '\n' + errorData?.fields?.requestBody?.message : ''
        throw new TsoaValidationError(status, statusText, message, context)
      }
      throw new HttpError(status, statusText, message, context)
    }

    // If response is ok, return the parsed JSON data
    return response
  }

  private handleJsonApiResponse = async (response: Response): Promise<any> => {
    const handledResponse = await this.handleApiResponse(response)
    if (handledResponse.status === 204) {
      return undefined
    }
    const text = await handledResponse.text()
    return text ? JSON.parse(text) : undefined
  }

  private refreshTokenAndRetry = async <Response, Payload>(
    error: unknown,
    operation: FetchOperation<Response, Payload>,
    options: RequestInit<Payload>
  ): Promise<Response> => {
    if (error instanceof HttpError && error.status === 401 && !options.noRefresh) {
      await this.refreshToken<Payload>()
      return await this.retryOperation(operation, options)
    }
    throw error
  }

  private refreshToken = async <Payload>(): Promise<void> => {
    const endpoint = '/auth/refresh'
    const url = this.buildQueryUrl<Payload>({ endpoint })
    const requestOptions = this.buildRequestOptions(this.buildJsonRequestOptions({ endpoint }, 'POST'))
    const response = await fetch(url, requestOptions)
    try {
      await this.handleApiResponse(response)
    } catch (error) {
      if (error instanceof HttpError) {
        this.sessionExpiredNotifier.notify()
        throw new RefreshTokenError(error.status, error.statusText, error.message, error.context)
      }
      throw error
    }
  }

  private retryOperation = async <Response, Payload>(operation: FetchOperation<Response, Payload>, options: RequestInit<Payload>) => {
    return await operation({ ...options, noRefresh: true })
  }

  private buildQueryUrl = <Payload>(options: RequestInit<Payload>) => {
    return `${API_ROOT}${options.endpoint}${options.querystring ? '?' + options.querystring : ''}`
  }

  private buildRequestOptions = <Payload = undefined>(options: RequestInit<Payload>) => {
    return {
      credentials: 'include' as const,
      ...(options.method ? { method: options.method } : {}),
      ...(options.headers ? { headers: options.headers } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.payload ? { body: JSON.stringify(options.payload) } : {})
    }
  }
}
