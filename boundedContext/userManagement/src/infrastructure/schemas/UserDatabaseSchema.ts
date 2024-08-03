export interface UserDatabaseSchema {
  id: string
  name: string
  password: string
  email: string
  roles: string // this is a json array in string format
  active: number
  createdAt: number
  updatedAt: number | null
}
