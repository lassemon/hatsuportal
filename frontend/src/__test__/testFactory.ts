import {
  CreateImageRequest,
  CreateStoryRequest,
  CreateUserRequest,
  ImageResponse,
  ImageWithRelationsResponse,
  StoryWithRelationsResponse,
  SearchStoriesRequest,
  UpdateImageRequest,
  UpdateStoryRequest,
  UpdateUserRequest,
  StoryResponse
} from '@hatsuportal/contracts'
import { EntityTypeEnum, ImageRoleEnum, ImageStateEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

const USER_ID = 'test1b19-user-4792-a2f0-f95ccab82d92'

export const loggedInUserId = (): string => {
  return 'test1b19-user-4792-a2f0-f95ccab82d92'
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 1537565,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Story,
      base64: 'asdasdasd',
      createdById: '345', // should not be able to give this
      createdByName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
    }
  }
}

export const updateImageRequest = (): UpdateImageRequest => {
  return {
    ...{
      id: imageDTOMock().id,
      mimeType: 'image/png',
      size: 1577165,
      ownerEntityId: '123',
      ownerEntityType: EntityTypeEnum.Blogpost,
      base64: 'loremipsum',
      createdById: 'test1b19-user-4792-a2f0-f95ccab82d92', // should not be able to change this
      createdByName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const imageDTOMock = () => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2metadata',
      mimeType: 'image/png',
      size: 1537565,
      createdById: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      createdByName: 'testUserName',
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdAt,
      updatedAt
    }
  }
}

export const imageResponse = (): ImageResponse => {
  return {
    ...{
      ...imageDTOMock()
    }
  }
}

export const imageWithRelationsResponse = (): ImageWithRelationsResponse => {
  return {
    ...{
      ...imageResponse(),
      createdByName: 'testUserName'
    }
  }
}

export const storyDTOMock = () => {
  return {
    id: 'test1b19-story-4792-a2f0-f95ccab82d92',
    visibility: VisibilityEnum.Public,
    createdById: USER_ID,
    createdAt,
    updatedAt,
    coverImageId: imageDTOMock().id,
    name: 'test story',
    description: 'A test story.',
    tagIds: []
  }
}

export const storyResponse = (): StoryResponse => {
  return {
    ...storyDTOMock()
  }
}

export const storyWithRelationsResponse = (): StoryWithRelationsResponse => {
  return {
    ...(storyResponse() as StoryResponse),
    coverImage: imageWithRelationsResponse(),
    createdByName: 'testUserName',
    imageLoadState: ImageStateEnum.Available,
    imageLoadError: null,
    tags: [],
    commentConnection: {
      totalCount: 0,
      comments: [],
      nextCursor: null
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
      id: 'not ok id', // should not be able to give this
      visibility: VisibilityEnum.Public,
      name: storyDTOMock().name,
      description: storyDTOMock().description,
      image: imageDTOMock(),
      createdById: '123', // should not be able to give this
      createdByName: 'foobar', // should not be able to give this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to give this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to give this
      tags: []
    }
  }
}

export const updateStoryRequest = (): UpdateStoryRequest => {
  return {
    ...{
      id: storyDTOMock().id,
      visibility: VisibilityEnum.Private,
      image: imageDTOMock(),
      name: 'test story name changed',
      description: 'A test story with a new description.',
      createdById: '123', // should not be able to change this
      createdByName: 'foobar', // should not be able to change this
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this
      updatedAt: unixtimeNow({ add: { minutes: 1 } }), // should not be able to change this
      tags: []
    }
  }
}

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

export const createUserRequest = (): CreateUserRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      name: 'username',
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
      id: userDTOMock().id,
      email: 'updatedemail',
      oldPassword: 'password',
      newPassword: 'updatedPassword',
      name: 'updated name',
      password: 'some password', // should not be able to change this directly
      roles: [UserRoleEnum.Editor, UserRoleEnum.Moderator],
      active: false,
      createdAt: unixtimeNow({ substract: { minutes: 1 } }), // should not be able to change this,
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}
