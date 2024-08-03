import { VisibilityEnum } from '@hatsuportal/common'
import { vi } from 'vitest'
import { UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { ImageDTO, StoryDTO, UserDTO } from '@hatsuportal/application'
import { ImageMetadataDatabaseSchema } from '../schemas/ImageMetadataDatabaseSchema'
import { StoryDatabaseSchema } from '../schemas/StoryDatabaseSchema'
import { IUserRepository } from '@hatsuportal/domain'
import {
  userDTOMock as userDTODomainMock,
  storyDTOMock as storyDTODomainMock,
  imageDTOMock as imageDTODomainMock
} from '@hatsuportal/domain'

export const userDTOMock = (): UserDTO => {
  return {
    ...userDTODomainMock()
  }
}

export const userDatabaseRecord = (): UserDatabaseSchema => {
  return {
    ...{
      id: userDTOMock().id,
      name: userDTOMock().name,
      password: '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW', // this is the word 'passwordhash' encrypted with bcrypt
      email: userDTOMock().email,
      roles: `["admin", "moderator"]`, // json types are strings in database
      active: 1, // tinyint datatype, 1 is true, 0 is false
      createdAt: userDTOMock().createdAt,
      updatedAt: userDTOMock().updatedAt
    }
  }
}

export const imageMetadataDatabaseRecord = (): ImageMetadataDatabaseSchema => {
  return {
    ...{
      id: imageDTOMock().id,
      visibility: imageDTOMock().visibility,
      fileName: imageDTOMock().fileName,
      mimeType: imageDTOMock().mimeType,
      size: 1537565,
      ownerId: storyDTOMock().id,
      ownerType: imageDTOMock().ownerType,
      createdBy: userDTOMock().id,
      createdByUserName: imageDTOMock().createdByUserName,
      createdAt: storyDTOMock().createdAt,
      updatedAt: storyDTOMock().updatedAt
    }
  }
}

export const imageDTOMock = (): ImageDTO => {
  return {
    ...imageDTODomainMock()
  }
}

export const storyDTOMock = (): StoryDTO => {
  return {
    ...storyDTODomainMock()
  }
}

export const storyDatabaseRecord = (): StoryDatabaseSchema => {
  return {
    ...{
      id: storyDTOMock().id,
      visibility: VisibilityEnum.Public,
      createdBy: userDTOMock().id,
      createdByUserName: storyDTOMock().createdByUserName,
      createdAt: storyDTOMock().createdAt,
      updatedAt: storyDTOMock().updatedAt,
      imageId: imageDTOMock().id,
      name: storyDTOMock().name,
      description: storyDTOMock().description
    }
  }
}

export const userRepositoryMock = () => {
  class UserRepositoryMock implements IUserRepository {
    setTransaction = vi.fn()
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
