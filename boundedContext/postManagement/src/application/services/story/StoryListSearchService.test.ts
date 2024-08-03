import { describe, expect, it } from 'vitest'
import { OrderEnum, SortableKeyEnum, UserRoleEnum } from '@hatsuportal/common'
import { EntityLoadResult } from '@hatsuportal/platform'
import { StoryListSearchService } from './StoryListSearchService'
import * as Fixture from '../../../__test__/testFactory'
import { UserLoadError } from '../../acl/userManagement/errors/UserLoadError'

describe('StoryListSearchService', () => {
  const baseCriteria = () => ({
    order: OrderEnum.Ascending,
    orderBy: SortableKeyEnum.TITLE,
    storiesPerPage: 10,
    pageNumber: 0,
    onlyMyStories: false
  })

  const setup = () => {
    const storyLookupService = Fixture.storyLookupServiceMock()
    const userGateway = Fixture.userGatewayMock()
    const service = new StoryListSearchService(storyLookupService, userGateway)
    return { storyLookupService, userGateway, service }
  }

  it('defaults anonymous search to public visibility and uses findAllPublic', async () => {
    const { storyLookupService, service } = setup()
    storyLookupService.findAllPublic.mockResolvedValue([Fixture.storyMock() as never])

    const result = await service.search({ searchCriteria: baseCriteria() })

    expect(storyLookupService.findAllPublic).toHaveBeenCalledTimes(1)
    expect(result.stories).toHaveLength(1)
  })

  it('defaults logged-in search without filters to public and logged-in visibility', async () => {
    const { storyLookupService, userGateway, service } = setup()
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    storyLookupService.findAllVisibleForLoggedInCreator.mockResolvedValue([Fixture.storyMock() as never])

    await service.search({
      loggedInUserId: Fixture.sampleUserId,
      searchCriteria: baseCriteria()
    })

    expect(storyLookupService.findAllVisibleForLoggedInCreator).toHaveBeenCalledTimes(1)
  })

  it('uses findAll for superadmin without explicit filters', async () => {
    const { storyLookupService, userGateway, service } = setup()
    userGateway.getUserById.mockResolvedValue(
      EntityLoadResult.success(Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.SuperAdmin] }))
    )
    storyLookupService.findAll.mockResolvedValue([Fixture.storyMock() as never])

    await service.search({
      loggedInUserId: Fixture.sampleUserId,
      searchCriteria: baseCriteria()
    })

    expect(storyLookupService.findAll).toHaveBeenCalledTimes(1)
  })

  it('uses search and count when filters are defined', async () => {
    const { storyLookupService, userGateway, service } = setup()
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    storyLookupService.search.mockResolvedValue([Fixture.storyMock() as never])
    storyLookupService.count.mockResolvedValue(1)

    await service.search({
      loggedInUserId: Fixture.sampleUserId,
      searchCriteria: {
        ...baseCriteria(),
        search: 'hello'
      }
    })

    expect(storyLookupService.search).toHaveBeenCalledTimes(1)
    expect(storyLookupService.count).toHaveBeenCalledTimes(1)
  })

  it('treats failed user load as anonymous for visibility defaults', async () => {
    const { storyLookupService, userGateway, service } = setup()
    userGateway.getUserById.mockResolvedValue(
      EntityLoadResult.failure(new UserLoadError({ userId: 'unknown', error: new Error('missing') }))
    )
    storyLookupService.findAllPublic.mockResolvedValue([])

    await service.search({
      loggedInUserId: 'unknown-user-a2f0-f95ccab82d92',
      searchCriteria: baseCriteria()
    })

    expect(storyLookupService.findAllPublic).toHaveBeenCalledTimes(1)
  })

  it('returns empty page when storiesPerPage is negative', async () => {
    const { storyLookupService, service } = setup()
    storyLookupService.findAllPublic.mockResolvedValue([Fixture.storyMock() as never, Fixture.storyMock() as never])

    const result = await service.search({
      searchCriteria: {
        ...baseCriteria(),
        storiesPerPage: -1
      }
    })

    expect(result.stories).toEqual([])
  })
})
