import { PostTypeEnum, unixtimeNow, UserRoleEnum, VisibilityEnum } from '@hatsuportal/common'

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const userDTO = () => {
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

export const storyDTO = () => {
  return {
    ...{
      id: 'test1b19-story-4792-a2f0-f95ccab82d92',
      visibility: VisibilityEnum.Public,
      createdBy: userDTO().id,
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt,
      imageId: imageDTO().id,
      name: 'test story',
      description: 'A test story.'
    }
  }
}

export const imageMetadataDTO = () => {
  return {
    ...{
      id: 'test1b19-enti-ty92-a2f0-f95cc2metadata',
      visibility: VisibilityEnum.Public,
      fileName: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      ownerId: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      ownerType: PostTypeEnum.Story,
      createdBy: 'test1b19-81db-4792-a2f0-f95ccab82d92',
      createdByUserName: 'testUserName',
      createdAt,
      updatedAt
    }
  }
}

export const imageDTO = () => {
  return {
    ...{
      ...imageMetadataDTO(),
      base64: 'data:image/png;base64,iVBORw0KGgo'
    }
  }
}
