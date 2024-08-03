export type UserErrorCode =
  | 'INVALID_PASSWORD'
  | 'INVALID_EMAIL'
  | 'INVALID_USERNAME'
  | 'INVALID_ROLE'
  | 'INVALID_USER_ID'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL'

export interface UserCommandError extends Error {
  readonly code: UserErrorCode
}
