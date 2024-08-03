import { HttpError } from '@hatsuportal/presentation'
import { IHttpClient, RequestInit } from 'application'
import { TsoaValidationError } from 'infrastructure'

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
  public getJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    const url = this.buildQueryUrl<Payload>(options)
    const requestOptions = this.buildRequestOptions<Payload>(options)
    try {
      const response = await fetch(url, {
        ...{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        ...requestOptions
      })
      return await this.handleJsonApiResponse(response)
    } catch (error) {
      return await this.refreshTokenAndRetry<Response, Payload>(error, this.getJson, options)
    }
  }

  public postJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    const url = this.buildQueryUrl<Payload>(options)
    const requestOptions = this.buildRequestOptions<Payload>(options)
    try {
      const response = await fetch(url, {
        ...{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(options.payload) // body data type must match "Content-Type" header
        },
        ...requestOptions
      })

      return await this.handleJsonApiResponse(response)
    } catch (error) {
      return await this.refreshTokenAndRetry<Response, Payload>(error, this.postJson, options)
    }
  }

  public putJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    const url = this.buildQueryUrl<Payload>(options)

    const requestOptions = this.buildRequestOptions<Payload>(options)

    try {
      const response = await fetch(url, {
        ...{
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(options.payload) // body data type must match "Content-Type" header
        },
        ...requestOptions
      })

      return await this.handleJsonApiResponse(response)
    } catch (error) {
      return await this.refreshTokenAndRetry<Response, Payload>(error, this.putJson, options)
    }
  }

  public deleteJson = async <Response, Payload = undefined>(options: RequestInit<Payload>): Promise<Response> => {
    const url = this.buildQueryUrl<Payload>(options)
    const requestOptions = this.buildRequestOptions<Payload>(options)
    try {
      const response = await fetch(url, {
        ...{
          method: 'DELETE'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        ...requestOptions
      })
      return await this.handleJsonApiResponse(response)
    } catch (error) {
      return await this.refreshTokenAndRetry<Response, Payload>(error, this.deleteJson, options)
    }
  }

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
    return await handledResponse.json()
  }

  private refreshTokenAndRetry = async <Response, Payload>(
    error: any,
    operation: FetchOperation<Response, Payload>,
    options: RequestInit<Payload>
  ): Promise<Response> => {
    if (error.status === 401 && !options.noRefresh) {
      await this.refreshToken<Payload>()
      return await this.retryOperation(operation, options)
    }
    throw error
  }

  private refreshToken = async <Payload>(): Promise<any> => {
    const url = this.buildQueryUrl<Payload>({ endpoint: '/auth/refresh' })
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  private retryOperation = async <Response, Payload>(operation: FetchOperation<Response, Payload>, options: RequestInit<Payload>) => {
    return await operation({ ...options, noRefresh: true })
  }

  private buildQueryUrl = <Payload>(options: RequestInit<Payload>) => {
    return `${API_ROOT}${options.endpoint}${options.querystring ? '?' + options.querystring : ''}`
  }

  private buildRequestOptions = <Payload = undefined>(options: RequestInit<Payload>) => {
    return {
      ...(options.method ? { method: options.method } : {}),
      ...(options.headers ? { headers: options.headers } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.payload ? { body: JSON.stringify(options.payload) } : {})
    }
  }
}
