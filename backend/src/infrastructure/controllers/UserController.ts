import { Body, Delete, Get, Middlewares, Patch, Path, Post, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'

import { RootController } from './RootController'
import { UserResponse, CreateUserRequest, UpdateUserRequest, ErrorResponse } from '@hatsuportal/contracts'
import { User, UserDTO } from '@hatsuportal/user-management'
import { Authentication } from '../auth/Authentication'
import { TsoaRequest } from '../TsoaRequest'
import { container } from 'tsyringe'
import { IUserApiMapper } from '@hatsuportal/user-management'
import { AuthorizationError, ConcurrencyError } from '@hatsuportal/platform'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/users/')
export class UserController extends RootController {
  protected readonly userApiMapper: IUserApiMapper

  constructor() {
    super()
    this.userApiMapper = container.resolve('IUserApiMapper')
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @SuccessResponse(200, 'OK')
  @Get()
  public async getAll(
    @Request() request: TsoaRequest,
    @Res() usersFoundResponse: TsoaResponse<200, UserResponse[]>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const getAllUsersUseCase = this.useCaseFactory.createGetAllUsersUseCase()
      await getAllUsersUseCase.execute({
        loggedInUserId: request.user.id.value,
        allUsers: (users: UserDTO[]) => {
          usersFoundResponse(200, users.map(this.userApiMapper.toResponse))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(501, 'NotImplemented')
  @SuccessResponse(200, 'OK')
  @Get('{id}')
  public async get(
    @Request() request: TsoaRequest,
    @Res() userFoundResponse: TsoaResponse<200, UserResponse>,
    @Res() errorResponse: ServerError,
    id: string
  ) {
    try {
      this.validateAuthentication(request)

      // 'me' is a special case where we return the logged in user
      const requestingOwnProfile = id === 'me' || id === request.user.id.value

      if (!requestingOwnProfile) {
        throw new AuthorizationError('You do not have permission to view this profile.')
      }

      const userId = id === 'me' ? request.user.id.value : id

      const findUserInput = this.userApiMapper.toFindUserInputDTO(userId, request.user.id.value)
      const findUserUseCase = this.useCaseFactory.createFindUserUseCase()
      await findUserUseCase.execute({
        loggedInUserId: request.user.id.value,
        findUserInput,
        userFound: (foundUser: UserDTO) => {
          userFoundResponse(200, this.userApiMapper.toResponse(foundUser))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(200, 'OK')
  @Post()
  public async insert(
    @Request() request: TsoaRequest,
    @Body() createUserRequest: CreateUserRequest,
    @Res() updateResponse: TsoaResponse<200, UserResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createUserInput = this.userApiMapper.toCreateUserInputDTO(createUserRequest, request.user.id.value)
      const createUserUseCase = this.useCaseFactory.createCreateUserUseCase()
      await createUserUseCase.execute({
        createdById: request.user.id.value,
        createUserInput,
        userCreated: (createdUser: UserDTO) => {
          updateResponse(200, this.userApiMapper.toResponse(createdUser))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'OK')
  @Patch('{userId}')
  public async put(
    @Request() request: TsoaRequest,
    @Path() userId: string,
    @Body() updateUserRequest: UpdateUserRequest,
    @Res() updateResponse: TsoaResponse<200, UserResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const updateUserInput = this.userApiMapper.toUpdateUserInputDTO(updateUserRequest, userId, request.user.id.value)
      const updateUserUseCase = this.useCaseFactory.createUpdateUserUseCase()
      await updateUserUseCase.execute({
        updatedById: request.user.id.value,
        updateUserInput,
        userUpdated: (updatedUser: UserDTO) => {
          updateResponse(200, this.userApiMapper.toResponse(updatedUser))
        },
        updateConflict: (error: ConcurrencyError<User>) => {
          errorResponse(409, this.httpErrorMapper.mapApplicationErrorToHttpError(error))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'OK')
  @Delete('{id}')
  public async delete(
    @Request() request: TsoaRequest,
    @Res() errorResponse: ServerError,
    @Res() deleteResponse: TsoaResponse<200, void>,
    id: string
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const deactivateUserInput = this.userApiMapper.toDeactivateUserInputDTO(id, request.user.id.value)
      const deactivateUserUseCase = this.useCaseFactory.createDeactivateUserUseCase()
      await deactivateUserUseCase.execute({
        deactivatingUserId: request.user.id.value,
        deactivateUserInput,
        userDeactivated: () => {
          deleteResponse(200)
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
