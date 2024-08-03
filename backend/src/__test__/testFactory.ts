import { Mocked, vi } from 'vitest'
import { cloneDeep } from 'lodash'

import { StoryDTO } from '@hatsuportal/post-management'
import { UserDTO } from '@hatsuportal/user-management'
import {
  CreateImageRequest,
  CreateStoryRequest,
  CreateUserRequest,
  ImageResponse,
  SearchStoriesRequest,
  UpdateImageRequest,
  UpdateStoryRequest,
  UpdateUserRequest
} from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum, UserRoleEnum, VisibilityEnum, unixtimeNow } from '@hatsuportal/common'
import { IImageProcessingService, IImageStorageService, ImageDTO } from '@hatsuportal/media-management'
import { base64Payload } from './support/image/base64Payload'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const sampleUserId = 'test1b19-user-4792-a2f0-f95ccab82d92'
export const sampleStoryId = 'test1b19-story-4792-a2f0-f95ccab82d92'
export const sampleImageId = 'test1b19-image-92-a2f0-f95cc2metadata'
export const sampleImageVersionId = 'test1b19-image-version-92-a2f0-f95cc2metadata'

// TODO, cleaup this file to export only what backend tests need
export class TestError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const imageDTOMock = (): ImageDTO => {
  return cloneDeep({
    id: sampleImageId,
    storageKey: 'filename.png',
    mimeType: 'image/png',
    size: 1537565,
    createdById: sampleUserId,
    base64: 'data:image/png;base64,iVBORw0KGgo',
    currentVersionId: sampleImageVersionId,
    isCurrent: true,
    isStaged: false,
    createdAt,
    updatedAt
  })
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: '123',
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 1537565,
      base64: 'asdasdasd',
      createdById: sampleUserId, // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const imageResponse = (): ImageResponse => {
  return {
    id: imageDTOMock().id,
    createdById: imageDTOMock().createdById,
    createdAt: imageDTOMock().createdAt,
    updatedAt: imageDTOMock().updatedAt,
    mimeType: imageDTOMock().mimeType,
    size: imageDTOMock().size,
    base64: imageDTOMock().base64
  }
}

export const updateImageRequest = (): UpdateImageRequest => {
  return {
    ...{
      id: imageDTOMock().id,
      storageKey: 'filename.png',
      mimeType: 'image/png',
      size: 1577165,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Blogpost,
      base64: 'loremipsum',
      createdById: sampleUserId, // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const userDTOMock = (): UserDTO => {
  return cloneDeep({
    id: sampleUserId,
    name: 'username',
    email: 'email@test.com',
    roles: [UserRoleEnum.Admin],
    active: true,
    createdAt,
    updatedAt
  })
}

export const storyDTOMock = (): StoryDTO => {
  return cloneDeep({
    id: sampleStoryId,
    visibility: VisibilityEnum.Public,
    createdById: sampleUserId,
    createdAt,
    updatedAt,
    coverImageId: imageDTOMock().id,
    name: 'test story',
    description: 'A test story.',
    tagIds: []
  })
}

export const searchStoriesRequest = (): SearchStoriesRequest => {
  return cloneDeep({
    storiesPerPage: 50,
    pageNumber: 1,
    onlyMyStories: false,
    order: 'asc',
    orderBy: 'visibility',
    search: 'search string',
    visibility: ['logged_in', 'private'],
    hasImage: false
  })
}

export const createStoryRequest = (): CreateStoryRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    visibility: VisibilityEnum.Public,
    name: storyDTOMock().name,
    description: storyDTOMock().description,
    image: imageDTOMock(),
    createdById: sampleUserId, // should not be able to give this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to give this,
    tags: []
  })
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return cloneDeep({
    id: storyDTOMock().id,
    visibility: VisibilityEnum.Private,
    image: {
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo'
    },
    name: 'test story name changed',
    description: 'A test story with a new description.',
    createdById: sampleUserId, // should not be able to change this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to change this,
    tags: []
  })
}

export const createUserRequest = (): CreateUserRequest => {
  return cloneDeep({
    id: 'not ok id', // should not be able to give this
    name: 'username',
    email: 'email@test.com',
    roles: [UserRoleEnum.Admin],
    password: 'password',
    active: false, // should not be able to give this
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
  })
}

export const updateUserRequest = (): UpdateUserRequest => {
  return cloneDeep({
    id: sampleUserId,
    email: 'updatedemail',
    oldPassword: 'password',
    newPassword: 'updatedPassword',
    name: 'updated name',
    password: 'some password', // should not be able to change this directly
    roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
    active: false,
    createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
    updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
  })
}

export const imageProcessingServiceMock = (): Mocked<IImageProcessingService> => {
  class ImageProcessingService implements Mocked<IImageProcessingService> {
    resizeImage = vi.fn()
    getBufferMimeType = vi.fn()
  }

  return new ImageProcessingService()
}

export const imageStorageServiceMock = (): Mocked<IImageStorageService> => {
  class ImageStorageService implements Mocked<IImageStorageService> {
    writeImageBufferToFile = vi.fn()
    getImageFromFileSystem = vi.fn()
    deleteImageFromFileSystem = vi.fn()
    renameImage = vi.fn()
    clearLastLoadedMap = vi.fn()
  }

  return new ImageStorageService()
}

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}
