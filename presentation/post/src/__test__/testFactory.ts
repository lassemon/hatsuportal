import { EntityTypeEnum, ImageStateEnum, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { ImageDTO } from '@hatsuportal/common-bounded-context'
import { CreateStoryRequest } from '../api/requests/CreateStoryRequest'
import { UpdateStoryRequest } from '../api/requests/UpdateStoryRequest'
import { SearchStoriesRequest } from '../api/requests/SearchStoriesRequest'
import { ImageResponse } from '@hatsuportal/presentation-common'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

const USER_ID = 'test1b19-user-4792-a2f0-f95ccab82d92'

export const imageDTOMock = (): ImageDTO => {
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

export const imageResponse = (): ImageResponse => {
  return {
    ...{
      ...imageDTOMock()
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
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to give this
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
      updatedAt: unixtimeNow({ add: { minutes: 1 } }) // should not be able to change this
    }
  }
}

export const loggedInUserId = (): string => {
  return 'test1b19-user-4792-a2f0-f95ccab82d92'
}
