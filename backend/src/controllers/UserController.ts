import { Body, Delete, Get, Middlewares, Post, Put, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'

import { RootController } from './RootController'
import {
  CreateUserRequest,
  ErrorPresentationMapper,
  ErrorResponse,
  UpdateUserRequest,
  UserPresentationMapper,
  UserResponse
} from '@hatsuportal/presentation'
import { AuthorizationError, UserDTO } from '@hatsuportal/application'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'
import { Authentication } from '/infrastructure'
import { container } from 'tsyringe'

const userPresentationMapper = new UserPresentationMapper()
const errorPresentationMapper = new ErrorPresentationMapper()

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/user')
export class UserController extends RootController {
  constructor() {
    super()
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
          usersFoundResponse(200, users.map(userPresentationMapper.toResponse))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
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

      if (!requestingOwnProfile && !request.user.isAdmin()) {
        throw new AuthorizationError('You do not have permission to view this profile.')
      }

      const userId = id === 'me' ? request.user.id.value : id

      const findUserInput = userPresentationMapper.toFindUserInputDTO(userId, request.user.id.value)
      const findUserUseCase = this.useCaseFactory.createFindUserUseCase()
      await findUserUseCase.execute({
        findUserInput,
        userFound: (foundUser: UserDTO) => {
          userFoundResponse(200, userPresentationMapper.toResponse(foundUser))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
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
      const createUserInput = userPresentationMapper.toCreateUserInputDTO(createUserRequest, request.user.id.value)
      const createUserUseCase = this.useCaseFactory.createCreateUserUseCase()
      await createUserUseCase.execute({
        createUserInput,
        foundUser: (createdUser: UserDTO) => {
          updateResponse(200, userPresentationMapper.toResponse(createdUser))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'OK')
  @Put()
  public async put(
    @Request() request: TsoaRequest,
    @Body() updateUserRequest: UpdateUserRequest,
    @Res() updateResponse: TsoaResponse<200, UserResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const updateUserInput = userPresentationMapper.toUpdateUserInputDTO(updateUserRequest, request.user.id.value)
      const updateUserUseCase = this.useCaseFactory.createUpdateUserUseCase()
      await updateUserUseCase.execute({
        updateUserInput,
        userUpdated: (updatedUser: UserDTO) => {
          updateResponse(200, userPresentationMapper.toResponse(updatedUser))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('user')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'OK')
  @Delete('{id}')
  public async delete(@Request() request: TsoaRequest, @Res() errorResponse: ServerError, id: string): Promise<void> {
    try {
      this.validateAuthentication(request)
      const deactivateUserInput = userPresentationMapper.toDeactivateUserInputDTO(id, request.user.id.value)
      const deactivateUserUseCase = this.useCaseFactory.createDeactivateUserUseCase()
      await deactivateUserUseCase.execute({
        deactivateUserInput
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
