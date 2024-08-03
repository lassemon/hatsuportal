import { PostTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { vi } from 'vitest'
import { UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { ImageDTO, ImageMetadataDTO, IUserRepository, StoryDTO, UserDTO } from '@hatsuportal/application'
import { ImageMetadataDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const userDTO = (): UserDTO => {
  return {
    ...{
      id: 'test1b19-user-4792-a2f0-f95ccab82d92',
      name: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin, UserRoleEnum.Moderator],
      active: true,
      createdAt,
      updatedAt
    }
  }
}

export const userDatabaseRecord = (): UserDatabaseSchema => {
  return {
    ...{
      id: 'test1b19-user-4792-a2f0-f95ccab82d92',
      name: 'username',
      password: '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW', // this is the word 'passwordhash' encrypted with bcrypt
      email: 'email@test.com',
      roles: `["admin", "moderator"]`, // json types are strings in database
      active: 1,
      createdAt,
      updatedAt
    }
  }
}

export const imageMetadataDTO = (): ImageMetadataDTO => {
  return {
    ...{
      id: 'test1b19-meta-ty92-a2f0-f95cc2entity',
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: 'test1b19-story-4792-a2f0-f95ccab82d92',
      ownerType: PostTypeEnum.Story,
      createdBy: 'test1b19-user-4792-a2f0-f95ccab82d92',
      createdByUserName: 'username',
      createdAt,
      updatedAt
    }
  }
}

export const imageMetadataDatabaseRecord = (): ImageMetadataDatabaseSchema => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2entity',
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: storyDTO().id,
      ownerType: PostTypeEnum.Story,
      createdBy: 'test1b19-user-4792-a2f0-f95ccab82d92',
      createdByUserName: 'username',
      createdAt,
      updatedAt
    }
  }
}

export const imageDTO = (): ImageDTO => {
  return {
    ...{
      ...imageMetadataDTO(),
      base64: 'asdasdasd'
    }
  }
}

export const storyDTO = (): StoryDTO => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdBy: 'test1b19-user-4792-a2f0-f95ccab82d92',
      createdByUserName: 'username',
      createdAt,
      updatedAt,
      imageId: null,
      name: 'test story',
      description: 'A test story.'
    }
  }
}

export const storyDatabaseRecord = (): StoryDatabaseSchema => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdBy: 'test1b19-user-4792-a2f0-f95ccab82d92',
      createdByUserName: 'username',
      createdAt,
      updatedAt,
      imageId: imageMetadataDatabaseRecord().id,
      name: 'test story',
      description: 'A test story.'
    }
  }
}

export const userRepositoryMock = () => {
  class UserRepositoryMock implements IUserRepository {
    getAll = vi.fn()
    findById = vi.fn()
    getUserCredentialsByUserId = vi.fn()
    getUserCredentialsByUsername = vi.fn()
    findByName = vi.fn()
    count = vi.fn()
    insert = vi.fn()
    update = vi.fn()
    deactivate = vi.fn()
  }

  return new UserRepositoryMock()
}
