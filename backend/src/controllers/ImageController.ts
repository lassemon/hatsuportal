import { Body, Delete, Get, Middlewares, Post, Put, Request, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import {
  CreateImageRequest,
  ErrorPresentationMapper,
  ErrorResponse,
  ImagePresentationMapper,
  ImageResponse,
  InvalidRequestError,
  StoryPresentationMapper,
  StoryResponse,
  UpdateImageRequest
} from '@hatsuportal/presentation'
import { ImageDTO, StoryDTO } from '@hatsuportal/application'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'
import { container } from 'tsyringe'
import { Authentication } from '/infrastructure'

const imagePresentationMapper = new ImagePresentationMapper()
const storyPresentationMapper = new StoryPresentationMapper(imagePresentationMapper)
const errorPresentationMapper = new ErrorPresentationMapper()

// FIXME: REMOVE THIS FILE, SEPARATE IMAGE CONTROLLER NOT NEEDED YET

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('/')
export class ImageController extends RootController {
  @Tags('Image')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Response(500, 'InternalServerError')
  @SuccessResponse(200, 'OK')
  @Get('image/{imageId}')
  public async get(@Res() getResponse: TsoaResponse<200, ImageResponse>, @Res() errorResponse: ServerError, imageId?: string) {
    try {
      if (!imageId) {
        throw new InvalidRequestError('Missing required path parameter "imageId"')
      }
      const findImageUseCase = this.useCaseFactory.createFindImageUseCase()
      await findImageUseCase.execute({
        imageId: imageId,
        imageFound: (image: ImageDTO) => {
          getResponse(200, imagePresentationMapper.toResponse(image))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Post('image')
  public async create(
    @Request() request: TsoaRequest,
    @Body() createImageRequest: CreateImageRequest,
    @Res() createResponse: TsoaResponse<201, ImageResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      this.validateAuthentication(request)
      const createImageInput = imagePresentationMapper.toCreateImageInputDTO(createImageRequest, request.user.id.value)
      const createImageUseCase = this.useCaseFactory.createCreateImageUseCase()
      await createImageUseCase.execute({
        createImageInput,
        imageCreated: (createdImage: ImageDTO) => {
          createResponse(201, imagePresentationMapper.toResponse(createdImage))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse(201, 'Created')
  @Put('image')
  public async update(
    @Request() request: TsoaRequest,
    @Body() updateImageRequest: UpdateImageRequest,
    @Res() updateResponse: TsoaResponse<200, ImageResponse>,
    @Res() errorResponse: ServerError
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const updateImageInput = imagePresentationMapper.toUpdateImageInputDTO(updateImageRequest, request.user.id.value)
      const updateImageUseCase = this.useCaseFactory.createUpdateImageUseCase()
      await updateImageUseCase.execute({
        updateImageInput,
        imageUpdated: (updatedImage: ImageDTO) => {
          updateResponse(200, imagePresentationMapper.toResponse(updatedImage))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }

  @Tags('Image')
  @Middlewares(container.resolve<Authentication>('Authentication').authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @SuccessResponse(200, 'OK')
  @Delete('image/{storyId}')
  public async delete(
    @Request() request: TsoaRequest,
    storyId: string,
    @Res() deleteResponse: TsoaResponse<200, StoryResponse>,
    @Res() errorResponse: ServerError
  ): Promise<void> {
    try {
      this.validateAuthentication(request)
      const removeImageFromStoryInput = imagePresentationMapper.toRemoveImageFromStoryInputDTO(storyId, request.user.id.value)
      const removeImageFromStoryUseCase = this.useCaseFactory.createRemoveImageFromStoryUseCase()
      await removeImageFromStoryUseCase.execute({
        removeImageFromStoryInput,
        imageRemoved: (storyWithoutImage: StoryDTO) => {
          // TODO, returning story here makes only sense when there is 1to1 relatioship with story<->image, but prepare to change
          deleteResponse(200, storyPresentationMapper.toResponse(storyWithoutImage))
        }
      })
    } catch (error) {
      const httpError = errorPresentationMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
