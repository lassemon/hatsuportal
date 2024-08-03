import { ErrorResponse, SearchPostsRequest, SearchPostsResponse } from '@hatsuportal/contracts'
import { Get, Middlewares, Queries, Request, Res, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa'
import { RootController } from './RootController'
import { IPostApiMapper } from '@hatsuportal/post-management'
import { container as tsyringeContainer } from 'tsyringe'
import { TsoaRequest } from '../TsoaRequest'

/**
 * FIXME, TSOA does not allow union types in TsoaResponse first generics type, nor does it allow to import the ServerError from another file,
 * see https://github.com/lukeautry/tsoa/blob/c50fc6d4322b71f0746d6ff67000b6563593bbdb/docs/ExternalInterfacesExplanation.MD for possible details on import error.
 * Thus we need to redeclare this type at the top of each Controller.
 */
type ServerError = TsoaResponse<400 | 401 | 403 | 409 | 422 | 404 | 500 | 501, ErrorResponse>

@Route('posts')
export class PostsController extends RootController {
  protected readonly postApiMapper: IPostApiMapper

  constructor() {
    super()
    this.postApiMapper = tsyringeContainer.resolve<IPostApiMapper>('IPostApiMapper')
  }

  @Tags('Post')
  @Middlewares(RootController.authentication.passThroughAuthenticationMiddleware())
  @SuccessResponse(200, 'OK')
  @Get()
  public async search(
    @Request() request: TsoaRequest,
    @Queries() searchPostsRequest: SearchPostsRequest,
    @Res() searchResponse: TsoaResponse<200, SearchPostsResponse>,
    @Res() errorResponse: ServerError
  ) {
    try {
      const searchPostsInput = this.postApiMapper.toPostSearchCriteriaDTO(searchPostsRequest)
      const searchPostsUseCase = this.useCaseFactory.createSearchPostsUseCase()
      await searchPostsUseCase.execute({
        loggedInUserId: request.user?.id.value,
        searchCriteria: searchPostsInput,
        foundPosts: (posts, totalCount) => {
          searchResponse(200, {
            posts: posts.map(this.postApiMapper.toPostWithRelationsResponse),
            totalCount
          })
        }
      })
    } catch (error) {
      const httpError = this.httpErrorMapper.mapApplicationErrorToHttpError(error)
      errorResponse(httpError.status, httpError)
    }
  }
}
