import { PostTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImageDTO, StoryDTO, UserDTO } from '@hatsuportal/application'
import { CreateImageRequest } from '../api/requests/CreateImageRequest'
import { UpdateImageRequest } from '../api/requests/UpdateImageRequest'
import { CreateStoryRequest } from '../api/requests/CreateStoryRequest'
import { UpdateStoryRequest } from '../api/requests/UpdateStoryRequest'
import { CreateUserRequest } from '../api/requests/CreateUserRequest'
import { UpdateUserRequest } from '../api/requests/UpdateUserRequest'
import { SearchStoriesRequest } from '../api/requests/SearchStoriesRequest'
import { ImageResponse } from '../api/responses/ImageResponse'
import {
  userDTOMock as userDTODomainMock,
  storyDTOMock as storyDTODomainMock,
  imageDTOMock as imageDTODomainMock
} from '@hatsuportal/domain'

export const userDTO = (): UserDTO => {
  return {
    ...userDTODomainMock()
  }
}

export const imageDTO = (): ImageDTO => {
  return {
    ...imageDTODomainMock()
  }
}

export const imageResponse = (): ImageResponse => {
  return {
    ...{
      ...imageDTO()
    }
  }
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: '123',
      ownerType: PostTypeEnum.Story,
      base64: 'asdasdasd',
      createdBy: '345', // should not be able to give this
      createdByUserName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateImageRequest = (): UpdateImageRequest => {
  return {
    ...{
      id: imageDTO().id,
      visibility: VisibilityEnum.Private,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1577165,
      ownerId: '123',
      ownerType: PostTypeEnum.Blogpost,
      base64: 'loremipsum',
      createdBy: 'test1b19-user-4792-a2f0-f95ccab82d92', // should not be able to change this
      createdByUserName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const storyDTO = (): StoryDTO => {
  return {
    ...storyDTODomainMock()
  }
}

export const searchStoriesRequest = (): SearchStoriesRequest => {
  return {
    storiesPerPage: 50,
    pageNumber: 1,
    onlyMyStories: false,
    order: 'asc',
    orderBy: 'visibility',
    search: 'search string',
    visibility: ['logged_in', 'private'],
    hasImage: false
  }
}

export const createStoryRequest = (): CreateStoryRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      visibility: VisibilityEnum.Public,
      name: storyDTO().name,
      description: storyDTO().description,
      image: createImageRequest(),
      createdBy: '123', // should not be able to give this
      createdByUserName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return {
    ...{
      id: storyDTO().id,
      visibility: VisibilityEnum.Private,
      image: updateImageRequest(),
      name: 'test story name changed',
      description: 'A test story with a new description.',
      createdBy: '123', // should not be able to change this
      createdByUserName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const createUserRequest = (): CreateUserRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      username: 'username',
      email: 'email@test.com',
      roles: [UserRoleEnum.Admin],
      password: 'password',
      active: false, // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateUserRequest = (): UpdateUserRequest => {
  return {
    ...{
      id: userDTO().id,
      email: 'updatedemail',
      oldPassword: 'password',
      newPassword: 'updatedPassword',
      username: 'updated name',
      password: 'some password', // should not be able to change this directly
      roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
      active: false,
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const loggedInUserId = (): string => {
  return userDTO().id
}
