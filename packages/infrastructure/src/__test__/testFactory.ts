import {
  CreateImageRequestDTO,
  CreateItemRequestDTO,
  CreateUserRequestDTO,
  InsertUserQueryDTO,
  UpdateImageRequestDTO,
  UpdateItemRequestDTO,
  UpdateUserQueryDTO
} from '@hatsuportal/application'
import { UpdateUserRequestDTO } from '@hatsuportal/application/lib/api/requests/UpdateUserRequestDTO'
import { unixtimeNow } from '@hatsuportal/common'
import {
  EntityType,
  ImageMetadataDTO,
  ItemDTO,
  UserDatabaseEntity,
  UserDTO,
  UserRepositoryInterface,
  UserRole,
  Visibility
} from '@hatsuportal/domain'
import { vi } from 'vitest'

const createdAt = unixtimeNow()
const updatedAt = createdAt + 1500

export const user = (): UserDTO => {
  return {
    ...{
      id: 'userId',
      name: 'username',
      email: 'email',
      roles: [UserRole.Admin],
      active: true,
      createdAt,
      updatedAt
    }
  }
}

export const imageMetadata = (): ImageMetadataDTO => {
  return {
    ...{
      id: 'testImageId',
      visibility: Visibility.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: '123',
      ownerType: EntityType.Item,
      createdBy: '0',
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt
    }
  }
}

export const image = () => {
  return {
    ...{
      ...imageMetadata(),
      base64: 'asdasdasd'
    }
  }
}

export const createImageRequest = (): CreateImageRequestDTO => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      visibility: Visibility.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: '123',
      ownerType: EntityType.Item,
      base64: 'asdasdasd',
      createdBy: '345', // should not be able to give this
      createdByUserName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateImageRequest = (): UpdateImageRequestDTO => {
  return {
    ...{
      id: imageMetadata().id,
      visibility: Visibility.Private,
      size: 1577165,
      base64: 'loremipsum',
      createdBy: '123', // should not be able to change this
      createdByUserName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const item = (): ItemDTO => {
  return {
    ...{
      id: 'testItemId',
      visibility: Visibility.Public,
      createdBy: '0',
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt,
      imageId: null,
      name: 'test item',
      description: 'A test item.'
    }
  }
}

export const createItemRequest = (): CreateItemRequestDTO => {
  return {
    ...{
      item: {
        ...{
          id: 'not ok id', // should not be able to give this
          visibility: item().visibility,
          name: item().name,
          description: item().description,
          createdBy: '123', // should not be able to give this
          createdByUserName: 'foobar', // should not be able to give this
          createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
          updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
        }
      },
      image: {
        ...image()
      }
    }
  }
}

export const updateItemRequest = (): UpdateItemRequestDTO => {
  return {
    ...{
      item: {
        ...{
          id: item().id,
          visibility: Visibility.Private,
          name: 'test item name changed',
          description: 'A test item with a new description.',
          createdBy: '123', // should not be able to change this
          createdByUserName: 'foobar', // should not be able to change this
          createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
          updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
        }
      },
      image: {
        ...image()
      }
    }
  }
}

export const createUserRequest = (): CreateUserRequestDTO => {
  return {
    ...{
      ...user(),
      password: 'password',
      id: 'not ok id', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateUserRequest = (): UpdateUserRequestDTO => {
  return {
    ...{
      id: user().id,
      email: 'updatedemail',
      oldPassword: 'password',
      newPassword: 'updatedPassword',
      name: 'updated name',
      password: 'some password',
      roles: [UserRole.Editor, UserRole.Moderator],
      active: false,
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const userDatabaseEntity = (): UserDatabaseEntity => {
  return {
    ...{
      id: 'userId',
      name: 'username',
      password: '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW', // this is the word 'passwordhash' encrypted with bcrypt
      email: 'email',
      roles: `["admin", "moderator"]`, // json types are strings in database
      active: 1,
      createdAt,
      updatedAt
    }
  }
}

export const userRepositoryMock = () => {
  class UserRepositoryMock implements UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO> {
    getAll = vi.fn()
    findById = vi.fn()
    findWithPasswordById = vi.fn()
    findWithPasswordByName = vi.fn()
    findByName = vi.fn()
    count = vi.fn()
    insert = vi.fn()
    update = vi.fn()
    deactivate = vi.fn()
  }

  return new UserRepositoryMock()
}
