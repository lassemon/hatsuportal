import { EntityTypeEnum, unixtimeNow } from '@hatsuportal/common'
import Image from '../domain/entities/Image'
import { ImageMetadataDatabaseSchema } from '../infrastructure/schemas/ImageMetadataDatabaseSchema'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

const USER_ID = 'test1b19-user-4792-a2f0-f95ccab82d92'

export const imageDTOMock = () => {
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

export const imageMock = (): Image => {
  return new Image(imageDTOMock())
}

export const imageMetadataDatabaseRecord = (): ImageMetadataDatabaseSchema => {
  return {
    ...{
      id: imageDTOMock().id,
      fileName: imageDTOMock().fileName,
      mimeType: imageDTOMock().mimeType,
      size: 1537565,
      ownerEntityId: imageDTOMock().ownerEntityId,
      ownerEntityType: imageDTOMock().ownerEntityType,
      createdById: USER_ID,
      createdByName: 'testUserName',
      createdAt: imageDTOMock().createdAt,
      updatedAt: imageDTOMock().updatedAt
    }
  }
}
