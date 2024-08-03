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
import passport from 'passport'
import _ from 'lodash'
import { Authentication } from '/infrastructure'
import { RootController } from './RootController'
import {
  CreateStoryRequest,
  CreateStoryResponse,
  ErrorPresentationMapper,
  ErrorResponse,
  ImagePresentationMapper,
  StoryPresentationMapper,
  StoryResponse,
  MyStoriesResponse,
  SearchStoriesRequest,
  SearchStoriesResponse,
  UpdateStoryRequest,
  UpdateStoryResponse
} from '@hatsuportal/presentation'
import { ImageDTO, StoryDTO } from '@hatsuportal/application'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'

const authentication = new Authentication(passport)

const imagePresentationMapper = new ImagePresentationMapper()
const storyPresentationMapper = new StoryPresentationMapper()
const errorPresentationMapper = new ErrorPresentationMapper()

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/')
@Middlewares(authentication.passThroughAuthenticationMiddleware())
export class StoryController extends RootController {
  @Tags('Story')
  @SuccessResponse(200, 'OK')
  @Get('stories/')
  public async search(
    @Request() request: TsoaRequest,
    @Queries() searchStoriesRequest: SearchStoriesRequest,
    @Res() searchResponse: TsoaResponse<200, SearchStoriesResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const searchStoriesInput = storyPresentationMapper.toSearchStoriesInputDTO(searchStoriesRequest, request.user?.id.value)
      const searchStoriesUseCase = this.useCaseFactory.createSearchStoriesUseCase()
      await searchStoriesUseCase.execute({
        searchStoriesInput,
        foundStories: (stories, totalCount) => {
          searchResponse(200, {
            stories: stories.map(storyPresentationMapper.toResponse),
            totalCount
          })
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(authentication.authenticationMiddleware())
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
            stories: myStories.map(storyPresentationMapper.toResponse),
            totalCount: myStories.length ?? 0
          })
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
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
      const findStoryInput = storyPresentationMapper.toFindStoryInputDTO(storyId, request.user?.id.value)
      const findStoryUseCase = this.useCaseFactory.createFindStoryUseCase()
      await findStoryUseCase.execute({
        findStoryInput,
        storyFound: (story) => {
          getResponse(200, storyPresentationMapper.toResponse(story))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Post('story/')
  public async create(
    @Request() request: TsoaRequest,
    @Body() createStoryRequest: CreateStoryRequest,
    @Res() createResponse: TsoaResponse<201, CreateStoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createStoryInput = storyPresentationMapper.toCreateStoryInputDTO(createStoryRequest, request.user.id.value)
      const createStoryUseCase = this.useCaseFactory.createCreateStoryUseCase()
      await createStoryUseCase.execute({
        createStoryInput,
        storyCreated: (createdStory: StoryDTO, storyImage: ImageDTO | null) => {
          createResponse(201, {
            story: storyPresentationMapper.toResponse(createdStory),
            image: storyImage ? imagePresentationMapper.toResponse(storyImage) : null
          })
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse(200, 'Updated')
  @Put('story/')
  public async update(
    @Request() request: TsoaRequest,
    @Body() updateStoryRequest: UpdateStoryRequest,
    @Res() updateResponse: TsoaResponse<200, UpdateStoryResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const updateStoryInput = storyPresentationMapper.toUpdateStoryInputDTO(updateStoryRequest, request.user.id.value)
      const updateStoryUseCase = this.useCaseFactory.createUpdateStoryUseCase()
      await updateStoryUseCase.execute({
        updateStoryInput,
        storyUpdated: (story, storyImage) => {
          updateResponse(200, {
            story: storyPresentationMapper.toResponse(story),
            image: storyImage ? imagePresentationMapper.toResponse(storyImage) : null
          })
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Story')
  @Middlewares(authentication.authenticationMiddleware())
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
      const deleteStoryInput = storyPresentationMapper.toDeleteStoryInputDTO(storyId, request.user.id.value)
      const deleteStoryUseCase = this.useCaseFactory.createDeleteStoryUseCase()
      await deleteStoryUseCase.execute({
        deleteStoryInput,
        storyDeleted: (deletedStory) => {
          deleteResponse(200, storyPresentationMapper.toResponse(deletedStory))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
