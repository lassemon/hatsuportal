/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface CreateStoryRequest {
  visibility: string
  image: {
    mimeType: string
    size: number
    base64: string
  } | null
  name: string
  description: string
  tags: string[]
}
