import { EntityTypeEnum, ImageStateEnum, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { DomainEvent, ImageMetadataDatabaseSchema } from '@hatsuportal/common-bounded-context'
import { Mocked, vi } from 'vitest'
import { StoryDatabaseSchema } from '../infrastructure/schemas/StoryDatabaseSchema'
import { IStoryRepository, Story } from '../domain'
import { StoryProps } from '../domain/entities/Story'
import { Image, IImageRepository } from '@hatsuportal/common-bounded-context'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

const USER_ID = 'test1b19-user-4792-a2f0-f95ccab82d92'

export const imageMetadataDatabaseRecord = (): ImageMetadataDatabaseSchema => {
  return {
    ...{
      id: imageDTOMock().id,
      fileName: imageDTOMock().fileName,
      mimeType: imageDTOMock().mimeType,
      size: 1537565,
      ownerEntityId: storyDTOMock().id,
      ownerEntityType: imageDTOMock().ownerEntityType,
      createdById: USER_ID,
      createdByName: 'testUserName',
      createdAt: storyDTOMock().createdAt,
      updatedAt: storyDTOMock().updatedAt
    }
  }
}

export const storyDatabaseRecord = (): StoryDatabaseSchema => {
  return {
    ...{
      id: storyDTOMock().id,
      visibility: VisibilityEnum.Public,
      createdById: USER_ID,
      createdByName: 'testUserName',
      createdAt: storyDTOMock().createdAt,
      updatedAt: storyDTOMock().updatedAt,
      imageId: imageDTOMock().id,
      name: storyDTOMock().name,
      description: storyDTOMock().description
    }
  }
}

export const storyDTOMock = () => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdById: USER_ID,
      createdByName: 'testUserName',
      createdAt,
      updatedAt,
      image: imageDTOMock(),
      name: 'test story',
      description: 'A test story.',
      imageLoadState: ImageStateEnum.Available,
      imageLoadError: null
    }
  }
}

export const storyMock = (): Story => {
  const story = Story.create(storyDTOMock())

  // Spy on the methods but retain their original implementations
  vi.spyOn(story, 'getProps').mockImplementation(function (this: Story) {
    return Story.prototype.getProps.apply(this)
  })
  vi.spyOn(story, 'update').mockImplementation(function (this: Story, props: Partial<StoryProps>) {
    Story.prototype.update.apply(this, [props])
  })
  vi.spyOn(story, 'delete').mockImplementation(function (this: Story) {
    Story.prototype.delete.apply(this)
  })
  vi.spyOn(story, 'addDomainEvent').mockImplementation(function (this: Story, event: DomainEvent) {
    Story.prototype.addDomainEvent.apply(this, [event])
  })
  vi.spyOn(story, 'clearEvents').mockImplementation(function (this: Story) {
    Story.prototype.clearEvents.apply(this)
  })
  // TODO: Add more spies here, e.g. getters and setters?

  return story
}

export const imageDTOMock = () => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2metadata',
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerEntityId: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      ownerEntityType: EntityTypeEnum.Story,
      createdById: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      createdByName: 'testUserName',
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdAt,
      updatedAt
    }
  }
}

export const imageMock = (): Image => {
  return Image.create(imageDTOMock())
}

export const storyRepositoryMock = (): Mocked<IStoryRepository> => {
  class StoryRepositoryMock implements IStoryRepository {
    insert = vi.fn().mockResolvedValue(storyMock())
    update = vi.fn().mockResolvedValue(storyMock())
    count = vi.fn().mockResolvedValue(1)
    search = vi.fn().mockResolvedValue([storyMock()])
    findAllPublic = vi.fn().mockResolvedValue([storyMock()])
    findById = vi.fn().mockResolvedValue(storyMock())
    findByImageId = vi.fn().mockResolvedValue([storyMock()])
    findAllVisibleForLoggedInCreator = vi.fn().mockResolvedValue([storyMock()])
    findAllForCreator = vi.fn().mockResolvedValue([storyMock()])
    findLatest = vi.fn().mockResolvedValue([storyMock()])
    findStoriesOfCreatorByName = vi.fn().mockResolvedValue([storyMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesByCreator = vi.fn().mockResolvedValue(1)
    delete = vi.fn().mockResolvedValue(storyMock())
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new StoryRepositoryMock()
}

export const imageRepositoryMock = (): Mocked<IImageRepository> => {
  class ImageRepositoryMock implements IImageRepository {
    findById = vi.fn().mockResolvedValue(imageMock())
    insert = vi.fn().mockResolvedValue(imageMock())
    update = vi.fn().mockResolvedValue(imageMock())
    delete = vi.fn()
    setTransaction = vi.fn()
    clearLastLoadedMap = vi.fn()
  }
  return new ImageRepositoryMock()
}
