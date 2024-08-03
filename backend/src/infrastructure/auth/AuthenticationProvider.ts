import express from 'express'

export const expressAuthentication = async (request: express.Request, securityName: string, scopes: string[] = []): Promise<any> => {
  if (securityName === 'api_key') {
    let api_key
    if (request.query && request.query.api_key) {
      api_key = request.query.api_key
    }

    if (api_key && api_key === process.env.API_KEY) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Invalid Api Key'))
    }
  }
}
