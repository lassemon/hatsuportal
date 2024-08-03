export type MediaErrorCode = 'INVALID_MIME_TYPE' | 'IMAGE_TOO_LARGE' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'INTERNAL'

export interface MediaCommandError extends Error {
  readonly code: MediaErrorCode
}
