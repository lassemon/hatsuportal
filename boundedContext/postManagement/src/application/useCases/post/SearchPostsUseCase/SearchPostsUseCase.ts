import { isEmpty as _isEmpty } from 'lodash'
import { EntityTypeEnum, Logger, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { PostSearchCriteriaDTO, PostWithRelationsDTO } from '../../../dtos'
import { IPostApplicationMapper } from '../../../mappers/PostApplicationMapper'
import { IStoryLookupService } from '../../../services/story/StoryLookupService'
import { IStoryListSearchService } from '../../../services/story/StoryListSearchService'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { UserLoadResult } from '../../../acl/userManagement/outcomes/UserLoadResult'
import { IPostReadRepository } from '../../../read/IPostReadRepository'
import { PostCreatorId, PostId } from '../../../../domain'

const logger = new Logger('SearchPostsUseCase')

export interface ISearchPostsUseCaseOptions extends IUseCaseOptions {
  loggedInUserId?: string
  searchCriteria: PostSearchCriteriaDTO
  foundPosts(posts: PostWithRelationsDTO[], totalCount: number): void
}

export type ISearchPostsUseCase = IUseCase<ISearchPostsUseCaseOptions>

export class SearchPostsUseCase implements ISearchPostsUseCase {
  constructor(
    private readonly storyListSearchService: IStoryListSearchService,
    private readonly storyLookupService: IStoryLookupService,
    private readonly postReadRepository: IPostReadRepository,
    private readonly userGateway: IUserGateway,
    private readonly postApplicationMapper: IPostApplicationMapper
  ) {}

  async execute({ loggedInUserId, searchCriteria, foundPosts }: ISearchPostsUseCaseOptions) {
    if (searchCriteria.postType === EntityTypeEnum.Story) {
      await this.searchByType(loggedInUserId, searchCriteria, foundPosts)
      return
    }

    await this.searchAllTypes(loggedInUserId, searchCriteria, foundPosts)
  }

  private async searchByType(
    loggedInUserId: string | undefined,
    searchCriteria: PostSearchCriteriaDTO,
    foundPosts: (posts: PostWithRelationsDTO[], totalCount: number) => void
  ) {
    const storyCriteria = this.postApplicationMapper.toStorySearchCriteria(searchCriteria)
    const { stories, totalCount } = await this.storyListSearchService.search({ loggedInUserId, searchCriteria: storyCriteria })
    foundPosts(
      stories.map((story) => this.postApplicationMapper.fromStoryWithRelations(story)),
      totalCount
    )
  }

  private async searchAllTypes(
    loggedInUserId: string | undefined,
    searchCriteria: PostSearchCriteriaDTO,
    foundPosts: (posts: PostWithRelationsDTO[], totalCount: number) => void
  ) {
    const resolvedCriteria = await this.resolveVisibilityAndCreator(loggedInUserId, searchCriteria)
    const { posts, totalCount } = await this.postReadRepository.search(resolvedCriteria)

    if (posts.length === 0) {
      foundPosts([], 0)
      return
    }

    const storyIds = posts.filter((p) => p.postType === EntityTypeEnum.Story).map((p) => new PostId(p.id))
    // future post types: add similar grouping and lookup here (e.g. recipeIds → recipeLookupService.findByIds)

    const hydratedStories = storyIds.length > 0 ? await this.storyLookupService.findByIds(storyIds) : []

    const hydratedMap = new Map<string, PostWithRelationsDTO>()
    for (const story of hydratedStories) {
      hydratedMap.set(story.id, this.postApplicationMapper.fromStoryWithRelations(story))
    }

    const orderedResults = posts.flatMap((p) => {
      const hydrated = hydratedMap.get(p.id)
      if (!hydrated) {
        logger.warn(`Post ${p.id} (${p.postType}) could not be hydrated — no matching lookup service result`)
        return []
      }
      return [hydrated]
    })

    foundPosts(orderedResults, totalCount)
  }

  private async resolveVisibilityAndCreator(
    loggedInUserId: string | undefined,
    searchCriteria: PostSearchCriteriaDTO
  ): Promise<PostSearchCriteriaDTO> {
    const loadUserResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()

    const resolved = { ...searchCriteria }
    const callerProvidedVisibility = !_isEmpty(searchCriteria.visibility)

    if (loadUserResult.isSuccess()) {
      const loggedInUser = loadUserResult.value
      resolved.loggedInCreatorId = new PostCreatorId(loggedInUser.id)
      resolved.isSuperAdmin = loggedInUser.roles.includes(UserRoleEnum.SuperAdmin)

      if (callerProvidedVisibility) {
        // Keep the caller's filter exactly as supplied; access control is enforced in withPostAccess.
        resolved.isVisibilityUserProvided = true
      } else {
        resolved.isVisibilityUserProvided = false
        if (!resolved.isSuperAdmin) {
          // Default for regular logged-in users: public + logged-in from anyone, plus own private.
          resolved.visibility = [VisibilityEnum.Public, VisibilityEnum.LoggedIn]
        }
        // SuperAdmin with no filter: leave visibility empty → withPostAccess applies no restriction.
      }
    } else {
      // Anonymous or unrecognised user: restrict to public only.
      resolved.visibility = [VisibilityEnum.Public]
      resolved.isVisibilityUserProvided = false
    }

    return resolved
  }
}
