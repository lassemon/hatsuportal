import { Body, Delete, Get, Middlewares, Post, Put, Request, Response, Route, SuccessResponse, Tags } from 'tsoa'
import { ApiError } from '@hatsuportal/domain'
import { CreateImageUseCase } from './useCases/CreateImageUseCase'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import Authentication from '../auth/Authentication'
import passport from 'passport'
import { ImageMapper, ItemMapper } from '@hatsuportal/infrastructure'
import { RemoveImageFromItemUseCase } from './useCases/RemoveImageFromItemUseCase'
import { UpdateImageUseCase } from './useCases/UpdateImageUseCase'
import { CreateImageRequestDTO, ImageResponseDTO, ItemResponseDTO, UpdateImageRequestDTO } from '@hatsuportal/application'
import { ImageProcessingService } from './services/ImageProcessingService'
import { ImageStorageService } from './services/ImageStorageService'
import { ImageService } from './services/ImageService'
import { FindImageUseCase } from './useCases/FindImageUseCase'
import ItemRepository from '/item/ItemRepository'
import ImageMetadataRepository from './ImageMetadataRepository'
import { RootController } from '/common/RootController'

const authentication = new Authentication(passport)

const imageProcessingService = new ImageProcessingService()
const imageStorageService = new ImageStorageService()
const imageService = new ImageService(imageProcessingService, imageStorageService)
const imageMapper = new ImageMapper()
const itemMapper = new ItemMapper()
const imageMetadataRepository = new ImageMetadataRepository(imageMapper)
const itemRepository = new ItemRepository(itemMapper)
const createImageUseCase = new CreateImageUseCase(imageService, imageMetadataRepository, imageMapper)
const updateImageUseCase = new UpdateImageUseCase(imageService, imageMetadataRepository, imageMapper)
const removeImageFromItemUseCase = new RemoveImageFromItemUseCase(itemRepository, imageStorageService, imageMetadataRepository, itemMapper)

const findImageUseCase = new FindImageUseCase(imageMetadataRepository, imageService)

@Route('/')
export class ImageController extends RootController {
  @Tags('Image')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Get('image/{imageId}')
  public async get(imageId?: string): Promise<ImageResponseDTO | null> {
    if (!imageId) {
      throw new ApiError(422, 'Missing required path parameter "imageId"')
    }

    const image = await findImageUseCase.execute({
      imageId
    })

    return imageMapper.toResponse(image)
  }

  @Tags('Image')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse('201', 'Created')
  @Post('image')
  public async create(@Request() request: TsoaRequest, @Body() createImageRequest: CreateImageRequestDTO): Promise<ImageResponseDTO> {
    this.validateAuthentication(request)

    const image = await createImageUseCase.execute({
      user: request.user,
      createImageRequest
    })

    return imageMapper.toResponse(image)
  }

  @Tags('Image')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse('201', 'Created')
  @Put('image')
  public async update(@Request() request: TsoaRequest, @Body() updateImageRequest: UpdateImageRequestDTO): Promise<ImageResponseDTO> {
    this.validateAuthentication(request)

    const image = await updateImageUseCase.execute({
      updateImageRequest
    })

    return imageMapper.toResponse(image)
  }

  @Tags('Image')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Delete('image/{itemId}')
  public async delete(@Request() request: TsoaRequest, itemId?: string): Promise<ItemResponseDTO> {
    this.validateAuthentication(request)
    if (!itemId) {
      throw new ApiError(422, 'Missing required path parameter "itemId"')
    }

    const item = await removeImageFromItemUseCase.execute({
      itemId,
      user: request.user
    })

    return itemMapper.toResponse(item)
  }
}
