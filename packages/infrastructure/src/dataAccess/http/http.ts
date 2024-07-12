import { Logger } from '@hatsuportal/common'

const logger = new Logger('http')

export interface HttpOptions extends RequestInit {
  baseUrl?: string
  endpoint: string
  queryParameters?: { [key: string]: any }
}

export const get = async <T>(options: HttpOptions): Promise<T> => {
  const url = buildQueryUrl(options)
  try {
    const response = await fetch(url, { ...options, method: 'GET' })
    const handledResponse = await handleResponse(response)
    return handledResponse.json()
  } catch (error) {
    logger.debug(`HTTP GET Request Failed for url: ${url}`, error)
    throw error
  }
}

export const post = async <T>(options: HttpOptions, body?: any): Promise<T> => {
  const url = buildQueryUrl(options)
  try {
    const response = await fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    const handledResponse = await handleResponse(response)
    return handledResponse.json()
  } catch (error) {
    logger.debug(`HTTP POST Request Failed  for url: ${url}`, error)
    throw error
  }
}

export const put = async <T>(options: HttpOptions, body?: any): Promise<T> => {
  const url = buildQueryUrl(options)
  try {
    const response = await fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    const handledResponse = await handleResponse(response)
    return handledResponse.json()
  } catch (error) {
    logger.debug(`HTTP PUT Request Failed for url: ${url}`, error)
    throw error
  }
}

export const del = async <T>(options: HttpOptions): Promise<T> => {
  const url = buildQueryUrl(options)
  try {
    const response = await fetch(url, { ...options, method: 'DELETE' })
    const handledResponse = await handleResponse(response)
    return handledResponse.json()
  } catch (error) {
    logger.debug(`HTTP DELETE Request Failed for url: ${url}`, error)
    throw error
  }
}

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

const buildQueryUrl = ({ baseUrl = '', endpoint, queryParameters = {} }: HttpOptions): string => {
  return jsonToQueryString(`${baseUrl}${endpoint}`, queryParameters)
}

const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    // Depending on your error handling strategy, you might want to throw custom errors or handle them differently
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
  }
  return response
}
