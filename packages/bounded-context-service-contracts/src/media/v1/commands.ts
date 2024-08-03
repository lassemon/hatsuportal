import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'

export interface CreateStagedImageCommand {
  readonly ownerEntityType: EntityTypeEnum
  readonly ownerEntityId: string
  readonly role: ImageRoleEnum
  readonly base64: string
  readonly mimeType: string
  readonly size: number
  readonly createdById: string
}

export interface CreateStagedImageVersionResult {
  imageId: string
  stagedVersionId: string // the staged candidate
}

export interface PromoteImageVersionCommand {
  imageId: string
  stagedVersionId: string
}

export interface DiscardImageVersionCommand {
  imageId: string
  stagedVersionId: string
}

export interface UpdateImageCommand {
  updatedById: string
  imageId: string
  mimeType: string
  size: number
  base64: string
}

export interface UpdateImageResult {
  id: string
  storageKey: string
  mimeType: string
  size: number
  base64: string
  currentVersionId: string
  isCurrent: boolean
  isStaged: boolean
  createdById: string
  createdAt: number
  updatedAt: number
}

export interface DeleteImageCommand {
  deletedById: string
  imageId: string
}

export interface IMediaCommandFacade {
  createStagedImageVersion(command: CreateStagedImageCommand): Promise<CreateStagedImageVersionResult>
  promoteImageVersion(command: PromoteImageVersionCommand): Promise<void>
  discardImageVersion(command: DiscardImageVersionCommand): Promise<void>
  updateImage(command: UpdateImageCommand): Promise<UpdateImageResult>
  deleteImage(command: DeleteImageCommand): Promise<void>
}
