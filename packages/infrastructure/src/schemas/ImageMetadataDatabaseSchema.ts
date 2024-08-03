import { PostDatabaseSchema } from './PostDatabaseSchema'

export interface ImageMetadataDatabaseSchema extends PostDatabaseSchema {
  fileName: string
  mimeType: string
  size: number
  ownerId: string | null
  ownerType: string | null
}
