import { ApiError, User, UserDatabaseEntity, UserDTO, UserRole } from '@hatsuportal/domain'
import { NotMutableUpdateProperties, OmitNotMutableUpdateProperties, PartialExceptFor, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  CreateUserRequestDTO,
  Encryption,
  InsertUserQueryDTO,
  UpdateUserQueryDTO,
  UpdateUserRequestDTO,
  UserMapperInterface,
  UserResponseDTO
} from '@hatsuportal/application'
import _ from 'lodash'

export class UserMapper implements UserMapperInterface {
  createRequestToUser(createRequest: CreateUserRequestDTO): User {
    const userBlueprint: UserDTO = {
      id: uuid(),
      name: createRequest.name,
      email: createRequest.email,
      active: true,
      roles: createRequest.roles || [UserRole.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: null
    }
    return new User(userBlueprint)
  }

  updateRequestToUser(existingUser: UserDTO, updateUserRequest: UpdateUserRequestDTO): User {
    // easiest to use lodash merge here to avoid undefined members in updateRequest overwriting existing data to undefined
    const cleanedUpdate = _.omit(updateUserRequest, [...NotMutableUpdateProperties, 'updatedAt', 'password', 'oldPassword', 'newPassword'])
    return new User(_.merge({}, existingUser, cleanedUpdate))
  }

  public async toInsertQuery(user: UserDTO, password: string): Promise<InsertUserQueryDTO> {
    const encryptedPassword = await Encryption.encrypt(password)

    const userBlueprint = {
      id: user.id,
      password: encryptedPassword,
      name: user.name,
      email: user.email,
      active: user.active ? 1 : 0,
      roles: JSON.stringify(user.roles),
      createdAt: user.createdAt,
      updatedAt: null
    }

    if (password === userBlueprint.password) {
      throw new ApiError(400, 'BadRequest', 'Attempted to add unencrypted password to database')
    }

    return userBlueprint
  }

  public async toUpdateQuery(
    user: PartialExceptFor<OmitNotMutableUpdateProperties<UserDTO>, 'id'>,
    password?: string
  ): Promise<UpdateUserQueryDTO> {
    const newPassword = password ? await Encryption.encrypt(password) : undefined

    if (typeof password !== 'undefined' && password !== '' && password === newPassword) {
      throw new ApiError(400, 'BadRequest', 'Attempted to add unencrypted password to database')
    }

    return {
      id: user.id,
      name: user.name,
      ...(newPassword ? { password: newPassword } : {}),
      email: user.email,
      roles: JSON.stringify(user.roles),
      active: user.active ? 1 : 0,
      updatedAt: unixtimeNow()
    }
  }

  public toUser(databaseResponse: UserDatabaseEntity): User {
    const cleanedProps = {
      id: databaseResponse.id,
      name: databaseResponse.name,
      email: databaseResponse.email,
      roles: databaseResponse.roles,
      active: databaseResponse.active,
      createdAt: databaseResponse.createdAt,
      updatedAt: databaseResponse.updatedAt
    }
    return User.fromRecord(cleanedProps)
  }

  public toResponse(user: UserDTO): UserResponseDTO {
    return { ...user }
  }
}
