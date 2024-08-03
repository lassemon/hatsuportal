import {
  Body,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Queries,
  Request,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  TsoaResponse
} from 'tsoa'
import { RootController } from './RootController'
import { IHttpErrorMapper } from '/infrastructure/dataAccess/http/mappers/HttpErrorMapper'
import { IStoryApiMapper } from '/application/dataAccess/http/mappers/IStoryApiMapper'
import {
  ErrorResponse,
  StoryResponse,
  MyStoriesResponse,
  SearchStoriesRequest,
  SearchStoriesResponse,
  CreateStoryRequest,
  UpdateStoryRequest
} from '@hatsuportal/contracts'
import { StoryDTO } from '@hatsuportal/post-management'
import { TsoaRequest } from '/infrastructure/TsoaRequest'

import { Story } from '@hatsuportal/post-management'
import { container } from 'tsyringe'
import { ConcurrencyError } from '@hatsuportal/common-bounded-context'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/')
export class StoryController extends RootController {
  protected readonly storyApiMapper: IStoryApiMapper
  protected readonly httpErrorMapper: IHttpErrorMapper

  constructor() {
    super()
    this.storyApiMapper = container.resolve('IStoryApiMapper')
    this.httpErrorMapper = container.resolve('IHttpErrorMapper')
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get('stories/')
  public async search(
    @Request() request: TsoaRequest,
    @Queries() searchStoriesRequest: SearchStoriesRequest,
    @Res() searchResponse: TsoaResponse<200, SearchStoriesResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const searchStoriesInput = this.storyApiMapper.toSearchStoriesInputDTO(searchStoriesRequest, request.user?.id.value)
      const searchStoriesUseCase = this.useCaseFactory.createSearchStoriesUseCase()
      await searchStoriesUseCase.execute({
        searchStoriesInput,
        foundStories: (stories, totalCount) => {
          searchResponse(200, {
            stories: stories.map(this.storyApiMapper.toResponse),
            totalCount
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(200, 'OK')
  @Get('mystories/')
  public async mystories(
    @Request() request: TsoaRequest,
    @Res() searchResponse: TsoaResponse<200, MyStoriesResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const findMyStoriesUseCase = this.useCaseFactory.createFindMyStoriesUseCase()
      await findMyStoriesUseCase.execute({
        loggedInUserId: request.user.id.value,
        storiesFound: (myStories) => {
          searchResponse(200, {
            stories: myStories.map(this.storyApiMapper.toResponse),
            totalCount: myStories.length ?? 0
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @SuccessResponse(200, 'OK')
  @Get('story/{storyId}')
  public async get(
    @Request() request: TsoaRequest,
    @Path() storyId: string,
    @Res() getResponse: TsoaResponse<200, StoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const findStoryInput = this.storyApiMapper.toFindStoryInputDTO(storyId, request.user?.id.value)
      const findStoryUseCase = this.useCaseFactory.createFindStoryUseCase()
      await findStoryUseCase.execute({
        findStoryInput,
        storyFound: (story) => {
          getResponse(200, this.storyApiMapper.toResponse(story))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Post('story/')
  public async create(
    @Request() request: TsoaRequest,
    @Body() createStoryRequest: CreateStoryRequest,
    @Res() createResponse: TsoaResponse<201, StoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createStoryInput = this.storyApiMapper.toCreateStoryInputDTO(createStoryRequest, request.user.id.value)
      const createStoryUseCase = this.useCaseFactory.createCreateStoryUseCase()
      await createStoryUseCase.execute({
        createStoryInput,
        storyCreated: (createdStory: StoryDTO) => {
          createResponse(201, this.storyApiMapper.toResponse(createdStory))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'Updated')
  @Put('story/')
  public async update(
    @Request() request: TsoaRequest,
    @Body() updateStoryRequest: UpdateStoryRequest,
    @Res() updateResponse: TsoaResponse<200, StoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const updateStoryInput = this.storyApiMapper.toUpdateStoryInputDTO(updateStoryRequest, request.user.id.value)
      const updateStoryUseCase = this.useCaseFactory.createUpdateStoryUseCase()
      await updateStoryUseCase.execute({
        updateStoryInput,
        storyUpdated: (updatedStory: StoryDTO) => {
          updateResponse(200, this.storyApiMapper.toResponse(updatedStory))
        },
        updateConflict: (error: ConcurrencyError<Story>) => {
          errorResponse(409, this.httpErrorMapper.mapApplicationErrorToHttpError(error))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @SuccessResponse(200, 'OK')
  @Delete('story/{storyId}')
  public async delete(
    @Request() request: TsoaRequest,
    @Path() storyId: string,
    @Res() deleteResponse: TsoaResponse<200, StoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const deleteStoryInput = this.storyApiMapper.toDeleteStoryInputDTO(storyId, request.user.id.value)
      const deleteStoryUseCase = this.useCaseFactory.createDeleteStoryUseCase()
      await deleteStoryUseCase.execute({
        deleteStoryInput,
        storyDeleted: (deletedStory) => {
          deleteResponse(200, this.storyApiMapper.toResponse(deletedStory))
        },
        deleteConflict: (error: ConcurrencyError<Story>) => {
          errorResponse(409, this.httpErrorMapper.mapApplicationErrorToHttpError(error))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(RootController.authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @SuccessResponse(200, 'OK')
  @Delete('story/{storyId}/image')
  public async deleteImage(
    @Request() request: TsoaRequest,
    storyId: string,
    @Res() deleteResponse: TsoaResponse<200, StoryResponse>,
    @Res() errorResponse: ServerError
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const removeImageFromStoryInput = this.storyApiMapper.toRemoveImageFromStoryInputDTO(storyId, request.user.id.value)
      const removeImageFromStoryUseCase = this.useCaseFactory.createRemoveImageFromStoryUseCase()
      await removeImageFromStoryUseCase.execute({
        removeImageFromStoryInput,
        imageRemoved: (storyWithoutImage: StoryDTO) => {
          // TODO, returning story here makes only sense when there is 1to1 relatioship with story<->image, but prepare to change
          deleteResponse(200, this.storyApiMapper.toResponse(storyWithoutImage))
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
