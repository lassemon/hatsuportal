/**
 * This is a cross cutting concern that is used to define the database schema for the image metadata in any bounded context.
 */
export interface ImageMetadataDatabaseSchema {
  id: string
  fileName: string
  mimeType: string
  size: number
  ownerEntityId: string
  ownerEntityType: string
  createdById: string
  createdByName: string
  createdAt: number
  updatedAt: number
}
