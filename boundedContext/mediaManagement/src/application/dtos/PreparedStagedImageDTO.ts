export interface PreparedStagedImageDTO {
  readonly imageId: string
  readonly stagedVersionId: string
  readonly storageKey: string
  readonly mimeType: string
  readonly size: number
  readonly createdById: string
}
