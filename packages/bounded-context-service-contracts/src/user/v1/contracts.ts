export interface UserContract {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly roles: string[]
  readonly active: boolean
  readonly createdAt: number
  readonly updatedAt: number
}

export interface UserCredentialsContract {
  readonly userId: string
  readonly passwordHash: string
}
