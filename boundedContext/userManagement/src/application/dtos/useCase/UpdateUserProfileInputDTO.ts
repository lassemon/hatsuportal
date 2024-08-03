export type UpdateUserProfileImageInputDTO = Partial<{
  mimeType?: string
  size: number
  base64: string
}>

export interface UpdateUserProfileInputDTO {
  bio?: string
  statusMessage?: string
  image?: UpdateUserProfileImageInputDTO | null
}
