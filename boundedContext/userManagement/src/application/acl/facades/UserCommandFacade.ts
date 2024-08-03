import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ICreateUserUseCase } from '../../useCases/user/CreateUserUseCase'
import { IUpdateUserUseCase } from '../../useCases/user/UpdateUserUseCase'
import { IDeactivateUserUseCase } from '../../useCases/user/DeactivateUserUseCase'
import { IUserCommandMapper } from './mappers/UserCommandMapper'

export class UserCommandFacade implements userV1.IUserCommandFacade {
  constructor(
    private readonly createUserUseCase: ICreateUserUseCase,
    private readonly updateUserUseCase: IUpdateUserUseCase,
    private readonly deactivateUserUseCase: IDeactivateUserUseCase,
    private readonly userCommandMapper: IUserCommandMapper
  ) {}

  async createUser(command: userV1.CreateUserCommand): Promise<userV1.CreateUserResult> {
    // TODO, log or otherwise audit/handle the createdById from CreateUserCommand
    const createUserInput = this.userCommandMapper.toCreateUserInput(command)
    return new Promise<userV1.CreateUserResult>((resolve, reject) => {
      this.createUserUseCase
        .execute({
          createdById: command.createdById,
          createUserInput,
          userCreated: (user) => {
            resolve(this.userCommandMapper.toCreateUserResult({ userId: user.id }))
          }
        })
        .catch(reject)
    })
  }

  async updateUser(command: userV1.UpdateUserCommand): Promise<userV1.UpdateUserResult> {
    // TODO, log or otherwise audit/handle the updatedById from UpdateUserCommand
    const updateUserInput = this.userCommandMapper.toUpdateUserInput(command)
    return new Promise<userV1.UpdateUserResult>((resolve, reject) => {
      this.updateUserUseCase
        .execute({
          updatedById: command.updatedById,
          updateUserInput,
          updateConflict: (user) => {
            reject(new Error('User already exists'))
          },
          userUpdated: (user) => {
            resolve(this.userCommandMapper.toUpdateUserResult({ userId: user.id }))
          }
        })
        .catch(reject)
    })
  }

  async deactivateUser(command: userV1.DeactivateUserCommand): Promise<userV1.DeactivateUserResult> {
    // TODO, log or otherwise audit/handle the requestedById from DeactivateUserCommand
    const deactivateUserInput = this.userCommandMapper.toDeactivateUserInput(command)
    return new Promise<userV1.DeactivateUserResult>((resolve, reject) => {
      this.deactivateUserUseCase
        .execute({
          deactivatingUserId: command.requestedById,
          deactivateUserInput,
          userDeactivated: (user) => {
            resolve(this.userCommandMapper.toDeactivateUserResult({ userId: user.id }))
          }
        })
        .catch(reject)
    })
  }

  async deleteUser(command: userV1.DeleteUserCommand): Promise<userV1.DeleteUserResult> {
    // TODO, log or otherwise audit/handle the requestedById from DeleteUserCommand
    throw new Error('Not implemented')
  }
}
