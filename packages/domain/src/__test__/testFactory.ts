import { PostTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { User, UserProps } from '../entities/User'
import Story, { StoryProps } from '../entities/Story'
import Image from '../entities/Image'
import { vi } from 'vitest'
import { DomainEvent } from '../events/DomainEvent'
import { IUserRepository } from '../repositories/IUserRepository'
import { IStoryRepository } from '../repositories/IStoryRepository'
import { IImageRepository } from '../repositories/IImageRepository'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const userDTOMock = () => {
  return {
    ...{
      id: 'test1b19-user-4792-a2f0-f95ccab82d92',
      name: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin],
      active: true,
      createdAt,
      updatedAt
    }
  }
}

export const userMock = (): User => {
  const user = new User(userDTOMock())

  // Spy on the methods but retain their original implementations
  vi.spyOn(user, 'getProps').mockImplementation(function (this: User) {
    return User.prototype.getProps.apply(this)
  })
  vi.spyOn(user, 'update').mockImplementation(function (this: User, props: Partial<UserProps>) {
    Story.prototype.update.apply(this, [props])
  })

  return user
}

export const storyDTOMock = () => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdBy: userDTOMock().id,
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt,
      image: imageDTOMock(),
      name: 'test story',
      description: 'A test story.'
    }
  }
}

export const storyMock = (): Story => {
  const story = new Story(storyDTOMock())

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
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      ownerType: PostTypeEnum.Story,
      createdBy: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      createdByUserName: 'testUserName',
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdAt,
      updatedAt
    }
  }
}

export const imageMock = (): Image => {
  return new Image(imageDTOMock())
}

export const userRepositoryMock = () => {
  class UserRepositoryMock implements IUserRepository {
    getAll = vi.fn().mockResolvedValue([userMock()])
    findById = vi.fn().mockResolvedValue(userMock())
    getUserCredentialsByUserId = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: '1', passwordHash: '1' })
    findByName = vi.fn().mockResolvedValue(userMock())
    count = vi.fn().mockResolvedValue(userMock())
    insert = vi.fn().mockResolvedValue(userMock())
    update = vi.fn().mockResolvedValue(userMock())
    deactivate = vi.fn().mockResolvedValue(userMock())
    setTransaction = vi.fn()
  }
  return new UserRepositoryMock()
}

export const storyRepositoryMock = () => {
  class StoryRepositoryMock implements IStoryRepository {
    insert = vi.fn().mockResolvedValue(storyMock())
    update = vi.fn().mockResolvedValue(storyMock())
    count = vi.fn().mockResolvedValue(1)
    search = vi.fn().mockResolvedValue([storyMock()])
    findAllPublic = vi.fn().mockResolvedValue([storyMock()])
    findById = vi.fn().mockResolvedValue(storyMock())
    findByImageId = vi.fn().mockResolvedValue([storyMock()])
    findAllVisibleForLoggedInUser = vi.fn().mockResolvedValue([storyMock()])
    findAllForUser = vi.fn().mockResolvedValue([storyMock()])
    findLatest = vi.fn().mockResolvedValue([storyMock()])
    findUserStoriesByName = vi.fn().mockResolvedValue([storyMock()])
    countAll = vi.fn().mockResolvedValue(1)
    countStoriesCreatedByUser = vi.fn().mockResolvedValue(1)
    delete = vi.fn().mockResolvedValue(storyMock())
    setTransaction = vi.fn()
  }
  return new StoryRepositoryMock()
}

export const imageRepositoryMock = () => {
  class ImageRepositoryMock implements IImageRepository {
    findById = vi.fn().mockResolvedValue(imageMock())
    insert = vi.fn().mockResolvedValue(imageMock())
    update = vi.fn().mockResolvedValue(imageMock())
    delete = vi.fn()
    setTransaction = vi.fn()
  }
  return new ImageRepositoryMock()
}
