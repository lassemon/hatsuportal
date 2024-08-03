import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'

export const sampleUserId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
export const sampleUserName = 'testUserName'
export const sampleStoryId = 'c3d4e5f6-a7b8-4901-c234-567890abcdef'
export const sampleRecipeId = 'd4e5f6a7-b8c9-4012-d345-678901abcdef'
export const sampleImageId = 'e5f6a7b8-c9d0-4123-e456-789012abcdef'
export const sampleImageVersionId = '293a4b5c-6e7f-4567-c890-123456abcdef'
export const sampleImageStorageKey = `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${sampleImageId}_version-id_${sampleUserId}.png`
export const sampleTagId = 'f6a7b8c9-d0e1-4234-f567-890123abcdef'
export const sampleCommentId = '07182a3b-4c5d-4345-a678-901234abcdef'
export const sampleParentCommentId = '18293b4c-5d6e-4456-b789-012345abcdef'
export const sampleEmail = 'test@example.com'

/** this is the word 'passwordhash' encrypted with bcrypt */
export const samplePasswordHash = '$2a$10$Ktrlfz7aJd.Vnp4WZ7jvOeD21HoMZGorwPefzm0BOWyJ5SNgem8TW'

/** Lightweight data URL for default unit-test fixtures (avoids decoding the large sample PNG on every mock). */
export const sampleBase64DataUrl = 'data:image/png;base64,AAAA'
