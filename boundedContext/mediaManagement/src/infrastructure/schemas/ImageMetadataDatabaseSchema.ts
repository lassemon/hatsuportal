// FULL METADATA
export interface ImageMetadataDatabaseSchema {
  // -- images table --
  id: string
  createdById: string
  createdAt: number
  currentVersionId: string | null // current_version_id and version_id should always refer to the same version

  // -- image_versions table --
  // image_id -- only used to link with images table: image_id <-> id
  versionId: string | null // do not map version_id to the domain entity, it is only used to link with images table
  storageKey: string
  mimeType: string
  size: number
  isCurrent: boolean
  isStaged: boolean
  updatedAt: number // created_at in table, becomes updated_at in join
}

// IMAGE TABLE
export interface ImageDatabaseSchema {
  id: string
  createdById: string
  createdAt: number
  currentVersionId: string | null
}

// IMAGE VERSION TABLE
export interface ImageVersionDatabaseSchema {
  id: string
  imageId: string
  storageKey: string
  mimeType: string
  size: number
  isCurrent: boolean
  isStaged: boolean
  createdAt: number
}
