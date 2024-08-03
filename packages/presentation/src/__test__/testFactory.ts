import { PostTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'
import { ImageDTO, ImageMetadataDTO, StoryDTO, UserDTO } from '@hatsuportal/application'
import { CreateImageRequest } from '../api/requests/CreateImageRequest'
import { UpdateImageRequest } from '../api/requests/UpdateImageRequest'
import { CreateStoryRequest } from '../api/requests/CreateStoryRequest'
import { UpdateStoryRequest } from '../api/requests/UpdateStoryRequest'
import { CreateUserRequest } from '../api/requests/CreateUserRequest'
import { UpdateUserRequest } from '../api/requests/UpdateUserRequest'
import { SearchStoriesRequest } from '../api/requests/SearchStoriesRequest'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const userDTO = (): UserDTO => {
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

export const imageMetadataDTO = (): ImageMetadataDTO => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2entity',
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: '123',
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
      id: imageMetadataDTO().id,
      visibility: VisibilityEnum.Private,
      filename: 'filename.png',
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
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdBy: '0',
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt,
      imageId: null,
      name: 'test story',
      description: 'A test story.'
    }
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
      story: {
        ...{
          id: 'not ok id', // should not be able to give this
          visibility: VisibilityEnum.Public,
          name: storyDTO().name,
          description: storyDTO().description,
          imageId: null,
          createdBy: '123', // should not be able to give this
          createdByUserName: 'foobar', // should not be able to give this
          createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
          updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
        }
      },
      image: {
        ...createImageRequest()
      }
    }
  }
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return {
    ...{
      story: {
        ...{
          id: storyDTO().id,
          visibility: VisibilityEnum.Private,
          name: 'test story name changed',
          description: 'A test story with a new description.',
          createdBy: '123', // should not be able to change this
          createdByUserName: 'foobar', // should not be able to change this
          createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
          updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
        }
      },
      image: {
        ...updateImageRequest()
      }
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
