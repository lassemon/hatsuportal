export interface CreateStoryRequest {
  visibility: string
  image: {
    visibility: string
    mimeType: string
    size: number
    base64: string
  } | null
  name: string
  description: string
}
