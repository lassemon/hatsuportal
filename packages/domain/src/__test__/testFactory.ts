import { unixtimeNow } from '@hatsuportal/common'
import { Visibility } from '../enums/Visibility'
import { UserRole } from '../enums/UserRole'
import { EntityType } from '../enums/EntityType'

const createdAt = unixtimeNow()
const updatedAt = createdAt + 1500

export const entity = () => {
  return {
    ...{
      id: 'testId',
      visibility: Visibility.Public,
      createdBy: '0',
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt
    }
  }
}

export const serializedEntity = () => {
  return {
    ...{
      id: entity().id,
      visibility: entity().visibility,
      createdBy: entity().createdBy,
      createdByUserName: entity().createdByUserName,
      createdAt: entity().createdAt,
      updatedAt: entity().updatedAt
    }
  }
}

export const user = () => {
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

export const serializedUser = () => {
  return {
    ...{
      id: user().id,
      name: user().name,
      email: user().email,
      roles: user().roles,
      active: user().active,
      createdAt: user().createdAt,
      updatedAt: user().updatedAt
    }
  }
}

export const imageMetadata = () => {
  return {
    ...{
      ...entity(),
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: '123',
      ownerType: EntityType.Item
    }
  }
}

export const serializedImageMetadata = () => {
  return {
    ...{
      ...serializedEntity(),
      fileName: imageMetadata().fileName,
      mimeType: imageMetadata().mimeType,
      size: imageMetadata().size,
      ownerId: imageMetadata().ownerId,
      ownerType: imageMetadata().ownerType
    }
  }
}

export const image = () => {
  return {
    ...{
      ...imageMetadata(),
      base64: 'data:image/png;base64,iVBORw0KGgo'
    }
  }
}

export const serializedImage = () => {
  return {
    ...{
      ...serializedImageMetadata(),
      base64: image().base64
    }
  }
}
