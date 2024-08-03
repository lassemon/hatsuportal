import { UserRoleEnum, VisibilityEnum, unixtimeNow } from '@hatsuportal/common'
import {
  Comment,
  CommentAuthorId,
  CommentId,
  CommentProps,
  CoverImageId,
  PostCreatorId,
  PostId,
  PostTitle,
  PostVisibility,
  Story,
  StoryBody,
  StoryProps,
  TagId,
  CommentBody
} from '@hatsuportal/post-management'
import {
  Base64Image,
  FileSize,
  Image,
  ImageCreatorId,
  ImageId,
  ImageProps,
  ImageStorageKey,
  ImageVersion,
  ImageVersionId,
  ImageVersionProps,
  MimeType
} from '@hatsuportal/media-management'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import {
  sampleBase64DataUrl,
  sampleCommentId,
  sampleImageId,
  sampleImageVersionId,
  sampleStoryId,
  sampleUserId
} from '@hatsuportal/shared-kernel/test'
import { base64Payload } from './support/image/base64Payload'
import { Email } from '../../../boundedContext/userManagement/src/domain/valueObjects/Email'
import { UserName } from '../../../boundedContext/userManagement/src/domain/valueObjects/UserName'
import { UserId } from '../../../boundedContext/userManagement/src/domain/valueObjects/UserId'
import { User, UserProps } from '../../../boundedContext/userManagement/src/domain/entities/User'
import { DefaultThemeId } from '../../../boundedContext/userManagement/src/domain/valueObjects/DefaultThemeId'
import { NotificationSettings } from '../../../boundedContext/userManagement/src/domain/valueObjects/NotificationSettings'
import { ColorScheme, ColorSchemeEnum } from '../../../boundedContext/userManagement/src/domain/valueObjects/ColorScheme'
import { UserPreferences } from '../../../boundedContext/userManagement/src/domain/valueObjects/UserPreferences'
import { ProfileImageId } from '../../../boundedContext/userManagement/src/domain/valueObjects/ProfileImageId'
import { UserProfile } from '../../../boundedContext/userManagement/src/domain/valueObjects/UserProfile'
import { UserRole } from '../../../boundedContext/userManagement/src/domain/valueObjects/UserRole'
import { Bio } from '../../../boundedContext/userManagement/src/domain/valueObjects/Bio'
import { StatusMessage } from '../../../boundedContext/userManagement/src/domain/valueObjects/StatusMessage'

export { sampleUserId, sampleStoryId, sampleCommentId, sampleImageId, sampleImageVersionId } from '@hatsuportal/shared-kernel/test'

export const base64ImageBufferMock = (): Buffer => {
  return Buffer.from(base64Payload, 'base64')
}

const createdAt = unixtimeNow() - 3000
const updatedAt = createdAt + 1500

export const storyMock = (overrides: Partial<StoryProps> = {}): Story => {
  return Story.reconstruct({
    id: overrides.id ?? new PostId(sampleStoryId),
    createdById: overrides.createdById ?? new PostCreatorId(sampleUserId),
    title: overrides.title ?? new PostTitle('test story'),
    visibility: overrides.visibility ?? new PostVisibility(VisibilityEnum.Public),
    body: overrides.body ?? new StoryBody('A test story.'),
    coverImageId: overrides.coverImageId ?? CoverImageId.NOT_SET,
    tagIds: overrides.tagIds ?? ([] as TagId[]),
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(createdAt),
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(updatedAt)
  })
}

export const commentMock = (overrides: Partial<CommentProps> = {}): Comment => {
  return Comment.reconstruct({
    id: overrides.id ?? new CommentId(sampleCommentId),
    postId: overrides.postId ?? new PostId(sampleStoryId),
    authorId: overrides.authorId ?? new CommentAuthorId(sampleUserId),
    body: overrides.body !== undefined ? overrides.body : new CommentBody('A test comment.'),
    parentCommentId: overrides.parentCommentId !== undefined ? overrides.parentCommentId : null,
    isDeleted: overrides.isDeleted ?? false,
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(createdAt),
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(updatedAt)
  })
}

let cachedDefaultBase64Image: Base64Image | undefined

const defaultBase64Image = (): Base64Image => {
  if (!cachedDefaultBase64Image) {
    cachedDefaultBase64Image = Base64Image.create(sampleBase64DataUrl)
  }
  return cachedDefaultBase64Image
}

const imageVersionProps = (overrides: Partial<ImageVersionProps> = {}): ImageVersionProps => ({
  id: new ImageVersionId(sampleImageVersionId),
  imageId: new ImageId(sampleImageId),
  mimeType: new MimeType('image/png'),
  size: new FileSize(100),
  base64: defaultBase64Image(),
  storageKey: ImageStorageKey.fromString(`current_${sampleImageId}_${sampleImageVersionId}.png`),
  isCurrent: true,
  isStaged: false,
  createdById: new ImageCreatorId(sampleUserId),
  createdAt: new CreatedAtTimestamp(updatedAt),
  ...overrides
})

export const imageMock = (overrides: Partial<ImageProps> = {}, versionOverrides: Partial<ImageVersionProps> = {}): Image => {
  const versionMock = ImageVersion.reconstruct({
    ...imageVersionProps(versionOverrides),
    ...(overrides.id || versionOverrides.imageId ? { imageId: overrides.id ?? versionOverrides.imageId } : {})
  })

  return Image.reconstruct({
    id: overrides.id ?? new ImageId(sampleImageId),
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(createdAt),
    createdById: overrides.createdById ?? new ImageCreatorId(sampleUserId),
    currentVersionId: overrides.currentVersionId !== undefined ? overrides.currentVersionId : versionMock.id,
    versions: [versionMock],
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(updatedAt)
  })
}

export const userMock = (overrides: Partial<UserProps> = {}): User => {
  return User.reconstruct({
    id: overrides.id ?? new UserId(sampleUserId),
    name: overrides.name ?? new UserName('test user'),
    email: overrides.email ?? new Email('test@example.com'),
    active: overrides.active ?? true,
    roles: overrides.roles ?? [new UserRole(UserRoleEnum.Viewer)],
    profile:
      overrides.profile ??
      UserProfile.reconstruct({
        bio: new Bio('test bio'),
        statusMessage: new StatusMessage('test status message'),
        profileImageId: ProfileImageId.NOT_SET
      }),
    preferences:
      overrides.preferences ??
      UserPreferences.reconstruct({
        colorScheme: new ColorScheme(ColorSchemeEnum.Light),
        selectedThemeId: new DefaultThemeId(),
        notificationSettings: NotificationSettings.reconstruct({
          emailNotifications: true,
          pushNotifications: true
        })
      }),
    ...overrides,
    createdAt: overrides.createdAt ?? new CreatedAtTimestamp(createdAt),
    updatedAt: overrides.updatedAt ?? new UnixTimestamp(updatedAt)
  })
}
