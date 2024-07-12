import { Body, Delete, Get, Middlewares, Post, Put, Request, Response, Route, SuccessResponse, Tags } from 'tsoa'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import { UpdateUserUseCase } from './useCases/UpdateUserUseCase'
import { UserMapper, UserService } from '@hatsuportal/infrastructure'
import { CreateUserRequestDTO, UpdateUserRequestDTO, UserResponseDTO } from '@hatsuportal/application'
import { CreateUserUseCase } from './useCases/CreateUserUseCase'
import { GetAllUsersUseCase } from './useCases/GetAllUsersUseCase'
import { FindUserUseCase } from './useCases/FindUserUseCase'
import { DeactivateUserUseCase } from './useCases/DeadtivateUserUseCase'
import UserRepository from './UserRepository'
import { ApiError } from '@hatsuportal/domain'
import { RootController } from '/common/RootController'

const authentication = new Authentication(passport)

const userMapper = new UserMapper()
const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const createUserUseCase = new CreateUserUseCase(userRepository, userMapper)
const updateUserUseCase = new UpdateUserUseCase(userMapper, userRepository, userService)
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository)
const findUserUseCase = new FindUserUseCase(userRepository)
const deactivateUserUseCase = new DeactivateUserUseCase(userRepository)

@Route('/user')
export class UserController extends RootController {
  constructor() {
    super()
  }

  @Tags('user')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden')
  @Get()
  public async getAll(@Request() request: TsoaRequest): Promise<UserResponseDTO[]> {
    this.validateAuthentication(request)

    const users = await getAllUsersUseCase.execute({
      user: request.user
    })

    return users.map(userMapper.toResponse)
  }

  @Tags('user')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(501, 'NotImplemented')
  @SuccessResponse(200, 'Ok')
  @Get('{id}')
  public async get(@Request() request: TsoaRequest, id: string): Promise<UserResponseDTO> {
    // TODO, implement gettin a user per id for admin users, currenly this api returns only
    // the logged in user
    this.validateAuthentication(request)

    if (id) {
      throw new ApiError(501, 'NotImplemented', 'Getting user by id is not yet implemented.')
    }

    const user = await findUserUseCase.execute({
      user: request.user
    })

    return userMapper.toResponse(user)
  }

  @Tags('user')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(200, 'Ok')
  @Post()
  public async insert(@Request() request: TsoaRequest, @Body() createUserRequest: CreateUserRequestDTO): Promise<UserResponseDTO> {
    this.validateAuthentication(request)

    const createdUser = await createUserUseCase.execute({
      createUserRequest
    })

    return userMapper.toResponse(createdUser)
  }

  @Tags('user')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'Ok')
  @Put()
  public async put(@Request() request: TsoaRequest, @Body() requestBody: UpdateUserRequestDTO): Promise<UserResponseDTO> {
    this.validateAuthentication(request)

    const updatedUser = await updateUserUseCase.execute({
      userUpdateRequest: requestBody,
      user: request.user
    })

    return userMapper.toResponse(updatedUser)
  }

  @Tags('user')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'Ok')
  @Delete('{id}')
  public async delete(@Request() request: TsoaRequest, id: string): Promise<void> {
    this.validateAuthentication(request)
    await deactivateUserUseCase.execute({
      userId: id,
      user: request.user
    })
  }
}
