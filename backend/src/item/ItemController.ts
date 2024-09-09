import { Body, Delete, Get, Middlewares, Path, Post, Put, Queries, Request, Response, Route, SuccessResponse, Tags } from 'tsoa'
import passport from 'passport'
import { ApiError, ItemSortableKey, ItemSortFields, Order } from '@hatsuportal/domain'
import { TsoaRequest } from '../common/entities/TsoaRequest'
import {
  CreateItemResponseDTO,
  CreateItemRequestDTO,
  ItemResponseDTO,
  SearchItemsRequestDTO,
  SearchItemsResponseDTO,
  UpdateItemRequestDTO,
  UpdateItemResponseDTO,
  MyItemsResponseDTO
} from '@hatsuportal/application'
import { ImageMapper, ItemMapper } from '@hatsuportal/infrastructure'
import _ from 'lodash'

import Authentication from '../auth/Authentication'

import { RootController } from '/common/RootController'
const authentication = new Authentication(passport)

const imageMapper = new ImageMapper()
const itemMapper = new ItemMapper()

interface SearchQueryParams extends Omit<SearchItemsRequestDTO, 'order' | 'orderBy'> {
  order?: `${Order}`
  orderBy?: (typeof ItemSortFields)[number]
}

@Route('/')
@Middlewares(authentication.passThroughAuthenticationMiddleware())
export class ItemController extends RootController {
  @Tags('Item')
  @Get('items/')
  public async search(@Request() request: TsoaRequest, @Queries() queryParams: SearchQueryParams): Promise<SearchItemsResponseDTO> {
    if (request?.isAuthenticated()) {
      const searchItemsUseCase = this.useCaseFactory.createSearchItemsUseCase()
      const searchResult = await searchItemsUseCase.execute({
        user: request.user,
        ...{
          order: Order.Ascending,
          orderBy: ItemSortableKey.NAME,
          ...queryParams
        }
      })
      return {
        items: searchResult.items.map(itemMapper.toResponse),
        totalCount: searchResult.totalCount
      }
    } else {
      const searchItemsUseCase = this.useCaseFactory.createSearchItemsUseCase()
      const searchResult = await searchItemsUseCase.execute({
        ...{
          order: Order.Ascending,
          orderBy: ItemSortableKey.NAME,
          ...queryParams
        }
      })
      return {
        items: searchResult.items.map(itemMapper.toResponse),
        totalCount: searchResult.totalCount
      }
    }
  }

  @Tags('Item')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Get('myitems/')
  public async myitems(@Request() request: TsoaRequest): Promise<MyItemsResponseDTO> {
    this.validateAuthentication(request)
    const findMyItemsUseCase = this.useCaseFactory.createFindMyItemsUseCase()
    const myItems = await findMyItemsUseCase.execute({
      user: request.user
    })
    return myItems.map(itemMapper.toResponse)
  }

  @Tags('Item')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @Get('item/{itemId}')
  public async get(@Request() request: TsoaRequest, @Path() itemId: string): Promise<ItemResponseDTO> {
    if (!itemId) {
      throw new ApiError(422, 'Missing required path parameter "itemId"')
    }
    const findItemUseCase = this.useCaseFactory.createFindItemUseCase()
    const item = await findItemUseCase.execute({
      user: request.user,
      itemId
    })
    return itemMapper.toResponse(item)
  }

  @Tags('Item')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @SuccessResponse('201', 'Created')
  @Post('item/')
  public async create(@Request() request: TsoaRequest, @Body() createItemRequest: CreateItemRequestDTO): Promise<CreateItemResponseDTO> {
    this.validateAuthentication(request)
    const createItemUseCase = this.useCaseFactory.createCreateItemUseCase()
    const createdItemResponse = await createItemUseCase.execute({
      user: request.user,
      createItemRequest
    })
    return {
      item: itemMapper.toResponse(createdItemResponse.item),
      image: createdItemResponse.image ? imageMapper.toResponse(createdItemResponse.image) : null
    }
  }

  @Tags('Item')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @SuccessResponse('201', 'Created')
  @Put('item/')
  public async update(@Request() request: TsoaRequest, @Body() updateItemRequest: UpdateItemRequestDTO): Promise<UpdateItemResponseDTO> {
    this.validateAuthentication(request)
    const updateItemUseCase = this.useCaseFactory.createUpdateItemUseCase()
    const updateItemResponse = await updateItemUseCase.execute({
      user: request.user,
      updateItemRequest
    })
    return {
      item: itemMapper.toResponse(updateItemResponse.item),
      image: updateItemResponse.image ? imageMapper.toResponse(updateItemResponse.image) : null
    }
  }

  @Tags('Item')
  @Middlewares(authentication.authenticationMiddleware())
  @Response(401, 'Unauthorized')
  @Response(404, 'NotFound')
  @Response(422, 'UnprocessableContent')
  @SuccessResponse('200', 'OK')
  @Delete('item/{itemId}')
  public async deleteIem(@Request() request: TsoaRequest, @Path() itemId: string): Promise<ItemResponseDTO> {
    this.validateAuthentication(request)
    if (!itemId) {
      throw new ApiError(422, 'Missing required path parameter "itemId"')
    }
    const deleteItemUseCase = this.useCaseFactory.createDeleteItemUseCase()
    const deletedItem = await deleteItemUseCase.execute({
      itemId: itemId,
      user: request.user
    })
    return itemMapper.toResponse(deletedItem)
  }
}
