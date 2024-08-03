export interface JwtPayload {
  userId: string
  iss: string
  iat: number
  sub: string
  exp: number
}
