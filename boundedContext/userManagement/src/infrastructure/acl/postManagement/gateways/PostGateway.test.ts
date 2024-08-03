import { describe, expect, it, vi } from 'vitest'
import { postV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ApplicationError } from '@hatsuportal/platform'
import { VisibilityEnum } from '@hatsuportal/common'
import { PostGateway } from './PostGateway'
import { PostGatewayMapper } from '../mappers/PostGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('PostGateway', () => {
  const createSut = () => {
    const postQueryFacade: postV1.IPostQueryFacade = {
      getStoriesByCreatorId: vi.fn()
    }
    const postGatewayMapper = new PostGatewayMapper()
    const gateway = new PostGateway(postQueryFacade, postGatewayMapper)
    return { postQueryFacade, gateway }
  }

  const storyContract = (): postV1.StoryContract => ({
    id: Fixture.sampleStoryId,
    visibility: VisibilityEnum.Public,
    title: 'title',
    body: 'body',
    coverImage: null,
    tags: [],
    createdByName: Fixture.sampleUserName,
    createdById: Fixture.sampleUserId,
    createdAt: 1,
    updatedAt: 2
  })

  it('maps successful facade result to story read models', async () => {
    const { postQueryFacade, gateway } = createSut()
    vi.mocked(postQueryFacade.getStoriesByCreatorId).mockResolvedValue([storyContract()])

    const result = await gateway.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual([
      {
        id: Fixture.sampleStoryId,
        visibility: VisibilityEnum.Public,
        title: 'title',
        body: 'body',
        coverImage: null,
        tags: [],
        createdByName: Fixture.sampleUserName,
        createdById: Fixture.sampleUserId,
        createdAt: 1,
        updatedAt: 2
      }
    ])
  })

  it('returns failed load when facade throws an Error', async () => {
    const { postQueryFacade, gateway } = createSut()
    vi.mocked(postQueryFacade.getStoriesByCreatorId).mockRejectedValue(new Error('boom'))

    const result = await gateway.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(result.isFailed()).toBe(true)
    expect(result.error.error.message).toBe('boom')
  })

  it('wraps non-Error throws in ApplicationError', async () => {
    const { postQueryFacade, gateway } = createSut()
    vi.mocked(postQueryFacade.getStoriesByCreatorId).mockRejectedValue('not-an-error')

    const result = await gateway.getStoriesByCreatorId(Fixture.sampleUserId)

    expect(result.isFailed()).toBe(true)
    expect(result.error.error).toBeInstanceOf(ApplicationError)
    expect(result.error.error.message).toBe('Unknown error occurred')
  })
})
