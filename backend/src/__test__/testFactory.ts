import { base64Payload } from './support/image/base64Payload'

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}
