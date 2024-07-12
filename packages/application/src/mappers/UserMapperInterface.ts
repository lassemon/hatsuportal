import { User, UserDatabaseEntity, UserDTO } from '@hatsuportal/domain'
import { UserResponseDTO } from '../api/responses/UserResponseDTO'
import { CreateUserRequestDTO } from '../api/requests/CreateUserRequestDTO'
import { InsertUserQueryDTO } from '../persistence/queries/InsertUserQueryDTO'
import { UpdateUserRequestDTO } from '../api/requests/UpdateUserRequestDTO'
import { UpdateUserQueryDTO } from '../persistence/queries/UpdateUserQueryDTO'

export interface UserMapperInterface {
  createRequestToUser(createUserRequest: CreateUserRequestDTO): User
  updateRequestToUser(existingUser: UserDTO, updateUserRequest: UpdateUserRequestDTO): User
  toInsertQuery(user: UserDTO, password: string): Promise<InsertUserQueryDTO>
  toUpdateQuery(user: UserDTO, password?: string): Promise<UpdateUserQueryDTO>
  toUser(databaseResponse: UserDatabaseEntity): User
  toResponse(user: UserDTO): UserResponseDTO
}
