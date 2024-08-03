export interface UpdateStoryRequest {
  id: string
  visibility: string
  image: {
    id: string
    visibility?: string
    mimeType?: string
    size: number
    base64: string
  } | null
  name: string
  description: string
}
