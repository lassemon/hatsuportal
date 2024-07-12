import { FetchOptions } from '@hatsuportal/application'
import { ApiError, ApiValidateError } from '@hatsuportal/domain'
import _ from 'lodash'

const API_ROOT = '/api/v1'

export interface RequestInit extends FetchOptions {
  payload?: any
  endpoint: string
  querystring?: string
  noRefresh?: boolean
}

type FetchOperation<T> = (options: RequestInit) => Promise<T>

export const getJson = async <T>(options: RequestInit): Promise<T> => {
  const url = buildQueryUrl(options)
  const requestOptions = buildRequestOptions(options)
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
    return await handleJsonApiResponse(response)
  } catch (error) {
    return await refreshTokenAndRetry<T>(error, getJson, options)
  }
}

export const postJson = async <T>(options: RequestInit): Promise<T> => {
  const url = buildQueryUrl(options)
  const requestOptions = buildRequestOptions(options)
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

    return await handleJsonApiResponse(response)
  } catch (error) {
    return await refreshTokenAndRetry<T>(error, postJson, options)
  }
}

export const putJson = async <T>(options: RequestInit): Promise<T> => {
  const url = buildQueryUrl(options)

  const requestOptions = buildRequestOptions(options)

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

    return await handleJsonApiResponse(response)
  } catch (error) {
    return await refreshTokenAndRetry<T>(error, putJson, options)
  }
}

export const deleteJson = async <T>(options: RequestInit): Promise<T> => {
  const url = buildQueryUrl(options)
  const requestOptions = buildRequestOptions(options)
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
    return await handleJsonApiResponse(response)
  } catch (error) {
    return await refreshTokenAndRetry<T>(error, deleteJson, options)
  }
}

const handleApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorData = null
    try {
      // Attempt to parse the error response
      errorData = await response.json()
    } catch (error) {
      // If parsing fails, throw a generic ApiError
      throw new ApiError(response.status, response.statusText, 'Error processing response')
    }
    // Extract error information from the response
    let message = errorData.message || response.statusText
    const status = response.status
    const statusText = response.statusText
    const context = errorData.context || {}

    if (errorData.name === 'ValidateError') {
      message += errorData?.fields?.requestBody?.message ? '\n' + errorData?.fields?.requestBody?.message : ''
      throw new ApiValidateError(status, statusText, message, context)
    }
    // Throw a custom ApiError with the extracted information
    throw new ApiError(status, statusText, message, context)
  }

  // If response is ok, return the parsed JSON data
  return response
}

const handleJsonApiResponse = async (response: Response): Promise<any> => {
  const handledResponse = await handleApiResponse(response)
  return await handledResponse.json()
}

const refreshTokenAndRetry = async <T>(error: any, operation: FetchOperation<T>, options: RequestInit): Promise<T> => {
  if (error.status === 401 && !options.noRefresh) {
    await refreshToken()
    return await retryOperation(operation, options)
  }
  throw error
}

const refreshToken = async (): Promise<any> => {
  const url = buildQueryUrl({ endpoint: '/auth/refresh' })
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const retryOperation = async <T>(operation: FetchOperation<T>, options: RequestInit) => {
  return await operation({ ...options, noRefresh: true })
}

const buildQueryUrl = (options: RequestInit) => {
  return `${API_ROOT}${options.endpoint}${options.querystring ? '?' + options.querystring : ''}`
}

const buildRequestOptions = (options: RequestInit) => {
  return {
    ...(options.method ? { method: options.method } : {}),
    ...(options.headers ? { headers: options.headers } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.payload ? { body: JSON.stringify(options.payload) } : {})
  }
}
