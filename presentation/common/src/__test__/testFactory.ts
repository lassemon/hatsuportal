import { EntityTypeEnum, unixtimeNow } from '@hatsuportal/common'
import { CreateImageRequest } from '../api/requests/CreateImageRequest'
import { ImageDTO } from '@hatsuportal/common-bounded-context'
import { UpdateImageRequest } from '../api/requests/UpdateImageRequest'
import { ImageResponse } from '../api/responses/ImageResponse'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const loggedInUserId = (): string => {
  return 'test1b19-user-4792-a2f0-f95ccab82d92'
}

export const createImageRequest = (): CreateImageRequest => {
  return {
    ...{
      id: 'not ok id', // should not be able to give this
      fileName: 'filename.png',
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
      fileName: 'filename.png',
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
