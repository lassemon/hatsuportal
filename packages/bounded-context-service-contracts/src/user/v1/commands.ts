export interface CreateUserCommand {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly roles: string[]
  readonly createdById: string
}

export interface CreateUserResult {
  readonly userId: string
}

export interface UpdateUserCommand {
  readonly id: string
  readonly name?: string
  readonly email?: string
  readonly roles?: string[]
  readonly active?: boolean
  readonly oldPassword?: string
  readonly newPassword?: string
  readonly updatedById: string
}

export interface UpdateUserResult {
  readonly userId: string
}

export interface DeactivateUserCommand {
  readonly id: string
  readonly requestedById: string
}

export interface DeactivateUserResult {
  readonly userId: string
}

export interface DeleteUserCommand {
  readonly id: string
  readonly requestedById: string
}

export interface DeleteUserResult {
  readonly deleted: boolean
}

export interface IUserCommandFacade {
  createUser(command: CreateUserCommand): Promise<CreateUserResult>
  updateUser(command: UpdateUserCommand): Promise<UpdateUserResult>
  deactivateUser(command: DeactivateUserCommand): Promise<DeactivateUserResult>
  deleteUser(command: DeleteUserCommand): Promise<DeleteUserResult>
}
