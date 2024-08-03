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
  createdById: string
  imageId: string
  stagedVersionId: string // the staged candidate
}

export interface PreparedStagedImageContract {
  readonly imageId: string
  readonly stagedVersionId: string
  readonly storageKey: string
  readonly mimeType: string
  readonly size: number
  readonly createdById: string
}

export interface PromoteImageVersionCommand {
  promotedById: string
  imageId: string
  stagedVersionId: string
}

export interface DeleteImageCommand {
  deletedById: string
  imageId: string
}

export interface IMediaCommandFacade {
  /**
   * Workflow operation (not an end-user use case): uploads a staged image file to storage
   * outside the caller's transaction and returns a handle for subsequent registration steps.
   */
  prepareStagedImageFile(command: CreateStagedImageCommand): Promise<PreparedStagedImageContract>
  /**
   * Workflow operation: registers rollback cleanup for a prepared staged image so storage is not left
   * with unlinked files if the caller's Unit of Work fails after {@link prepareStagedImageFile}.
   *
   * Must be invoked inside the same transaction as {@link saveStagedImageMetadata}.
   */
  registerPreparedStagedImageFileRollbackCleanup(prepared: PreparedStagedImageContract): Promise<void>
  /**
   * Workflow operation: persists staged image metadata for a file already uploaded by
   * {@link prepareStagedImageFile}. Must run inside the same transaction as
   * {@link registerPreparedStagedImageFileRollbackCleanup}.
   */
  saveStagedImageMetadata(prepared: PreparedStagedImageContract): Promise<void>
  createStagedImageVersion(command: CreateStagedImageCommand): Promise<CreateStagedImageVersionResult>
  promoteImageVersion(command: PromoteImageVersionCommand): Promise<void>
  deleteImage(command: DeleteImageCommand): Promise<void>
}
