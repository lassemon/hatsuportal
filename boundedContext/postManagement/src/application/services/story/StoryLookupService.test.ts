import { describe, expect, it, vi } from 'vitest'
import { EntityLoadResult, NotFoundError } from '@hatsuportal/platform'
import { OrderEnum, SortableKeyEnum, ImageStateEnum } from '@hatsuportal/common'
import { StoryLookupService } from './StoryLookupService'
import { StoryApplicationMapper } from '../../mappers/StoryApplicationMapper'
import { PostCreatorId, PostId } from '../../../domain'
import * as Fixture from '../../../__test__/testFactory'
import { UserLoadError } from '../../acl/userManagement/errors/UserLoadError'
import { ImageLoadError } from '../../acl/mediaManagement/errors/ImageLoadError'

describe('StoryLookupService', () => {
  const setup = () => {
    const storyRepository = Fixture.storyReadRepositoryMock()
    const mediaGateway = Fixture.mediaGatewayMock()
    const tagRepository = Fixture.tagRepositoryMock()
    const userGateway = Fixture.userGatewayMock()
    const commentLookupService = Fixture.commentLookupServiceMock()
    const storyApplicationMapper = new StoryApplicationMapper()
    const service = new StoryLookupService(
      storyRepository,
      mediaGateway,
      tagRepository,
      userGateway,
      commentLookupService,
      storyApplicationMapper
    )
    return { storyRepository, mediaGateway, tagRepository, userGateway, commentLookupService, service }
  }

  it('returns null when story is not found', async () => {
    const { storyRepository, service } = setup()
    storyRepository.findById.mockResolvedValue(null)

    await expect(service.findById(new PostId(Fixture.sampleStoryId))).resolves.toBeNull()
  })

  it('delegates invalidateById to the read repository', () => {
    const { storyRepository, service } = setup()
    const storyId = new PostId(Fixture.sampleStoryId)

    service.invalidateById(storyId)

    expect(storyRepository.invalidateById).toHaveBeenCalledWith(storyId)
  })

  it('enriches story with creator, image, tags, and comments', async () => {
    const { storyRepository, userGateway, mediaGateway, commentLookupService, service } = setup()
    const readModel = Fixture.storyReadModelDTOMock()
    storyRepository.findById.mockResolvedValue(readModel)
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    mediaGateway.getImageById.mockResolvedValue(EntityLoadResult.success(Fixture.imageAttacmentMock()))
    commentLookupService.listTopLevelForPost.mockResolvedValue({
      comments: [Fixture.commentWithRelationsDTOMock()],
      nextCursor: null
    })

    const result = await service.findById(new PostId(Fixture.sampleStoryId))

    expect(result?.createdByName).toBe('Test User')
    expect(result?.coverImage?.id).toBe(Fixture.sampleImageId)
    expect(result?.tags).toHaveLength(1)
    expect(result?.commentListChunk.comments).toHaveLength(1)
  })

  it('throws NotFoundError when creator cannot be loaded', async () => {
    const { storyRepository, userGateway, service } = setup()
    storyRepository.findById.mockResolvedValue(Fixture.storyReadModelDTOMock())
    userGateway.getUserById.mockResolvedValue(
      EntityLoadResult.failure(new UserLoadError({ userId: Fixture.sampleUserId, error: new Error('missing') }))
    )

    await expect(service.findById(new PostId(Fixture.sampleStoryId))).rejects.toBeInstanceOf(NotFoundError)
  })

  it('returns failed image load state when media gateway fails', async () => {
    const { storyRepository, userGateway, mediaGateway, commentLookupService, service } = setup()
    storyRepository.findById.mockResolvedValue(Fixture.storyReadModelDTOMock())
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    mediaGateway.getImageById.mockResolvedValue(
      EntityLoadResult.failure(new ImageLoadError({ imageId: Fixture.sampleImageId, error: new Error('missing image') }))
    )
    commentLookupService.listTopLevelForPost.mockResolvedValue({ comments: [], nextCursor: null })

    const result = await service.findById(new PostId(Fixture.sampleStoryId))

    expect(result?.imageLoadState).toBe(ImageStateEnum.FailedToLoad)
    expect(result?.coverImage).toBeNull()
  })

  it('throws NotFoundError when comment author cannot be loaded', async () => {
    const { storyRepository, userGateway, mediaGateway, commentLookupService, service } = setup()
    storyRepository.findById.mockResolvedValue(Fixture.storyReadModelDTOMock())
    userGateway.getUserById
      .mockResolvedValueOnce(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
      .mockResolvedValueOnce(
        EntityLoadResult.failure(new UserLoadError({ userId: Fixture.sampleUserId, error: new Error('missing author') }))
      )
    mediaGateway.getImageById.mockResolvedValue(EntityLoadResult.skipped())
    commentLookupService.listTopLevelForPost.mockResolvedValue({
      comments: [Fixture.commentWithRelationsDTOMock()],
      nextCursor: null
    })

    await expect(service.findById(new PostId(Fixture.sampleStoryId))).rejects.toBeInstanceOf(NotFoundError)
  })

  it('delegates search to repository and enriches results', async () => {
    const { storyRepository, userGateway, mediaGateway, commentLookupService, service } = setup()
    storyRepository.search.mockResolvedValue([Fixture.storyReadModelDTOMock()])
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    mediaGateway.getImageById.mockResolvedValue(EntityLoadResult.skipped())
    commentLookupService.listTopLevelForPost.mockResolvedValue({ comments: [], nextCursor: null })

    const results = await service.search({
      order: OrderEnum.Ascending,
      orderBy: 'title' as never,
      storiesPerPage: 10,
      pageNumber: 0
    })

    expect(storyRepository.search).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(1)
  })

  it('passes count through to repository', async () => {
    const { storyRepository, service } = setup()
    storyRepository.count.mockResolvedValue(42)

    await expect(
      service.count({
        order: OrderEnum.Ascending,
        orderBy: 'title' as never,
        storiesPerPage: 10,
        pageNumber: 0
      })
    ).resolves.toBe(42)
  })

  const enrichMocks = (
    storyRepository: ReturnType<typeof Fixture.storyReadRepositoryMock>,
    userGateway: ReturnType<typeof Fixture.userGatewayMock>,
    mediaGateway: ReturnType<typeof Fixture.mediaGatewayMock>,
    commentLookupService: ReturnType<typeof Fixture.commentLookupServiceMock>
  ) => {
    userGateway.getUserById.mockResolvedValue(EntityLoadResult.success(Fixture.userReadModelDTOMock()))
    mediaGateway.getImageById.mockResolvedValue(EntityLoadResult.skipped())
    commentLookupService.listTopLevelForPost.mockResolvedValue({ comments: [], nextCursor: null })
  }

  it.each([
    ['findAll', () => (s: StoryLookupService) => s.findAll(SortableKeyEnum.TITLE, OrderEnum.Ascending), 'findAll'],
    ['findAllPublic', () => (s: StoryLookupService) => s.findAllPublic(SortableKeyEnum.TITLE, OrderEnum.Ascending), 'findAllPublic'],
    ['findLatest', () => (s: StoryLookupService) => s.findLatest(5, true), 'findLatest'],
    ['findByIds', () => (s: StoryLookupService) => s.findByIds([new PostId(Fixture.sampleStoryId)]), 'findByIds'],
    ['findByImageId', () => (s: StoryLookupService) => s.findByImageId(new PostId(Fixture.sampleImageId)), 'findByImageId'],
    [
      'findAllVisibleForLoggedInCreator',
      () => (s: StoryLookupService) =>
        s.findAllVisibleForLoggedInCreator(new PostCreatorId(Fixture.sampleUserId), SortableKeyEnum.TITLE, OrderEnum.Ascending),
      'findAllVisibleForLoggedInCreator'
    ],
    [
      'findAllForCreator',
      () => (s: StoryLookupService) => s.findAllForCreator(new PostCreatorId(Fixture.sampleUserId)),
      'findAllForCreator'
    ],
    [
      'findStoriesOfCreatorByName',
      () => (s: StoryLookupService) => s.findStoriesOfCreatorByName('test story', new PostCreatorId(Fixture.sampleUserId)),
      'findStoriesOfCreatorByName'
    ]
  ] as const)('enriches results for %s', async (_label, run, repoMethod) => {
    const { storyRepository, userGateway, mediaGateway, commentLookupService, service } = setup()
    ;(storyRepository[repoMethod] as ReturnType<typeof vi.fn>).mockResolvedValue([Fixture.storyReadModelDTOMock()])
    enrichMocks(storyRepository, userGateway, mediaGateway, commentLookupService)

    const results = await run()(service)

    expect(storyRepository[repoMethod]).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(1)
    expect(results[0].createdByName).toBe('Test User')
  })
})
