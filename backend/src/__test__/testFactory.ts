import { cloneDeep } from 'lodash'

import { StoryDTO } from '@hatsuportal/post-management'
import { UserDTO } from '@hatsuportal/user-management'
import { UserRoleEnum, VisibilityEnum, unixtimeNow } from '@hatsuportal/common'
import { ImageDTO } from '@hatsuportal/media-management'
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

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}
