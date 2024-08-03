export interface ImageAttachmentReadModelDTO {
  readonly id: string
  readonly storageKey: string
  readonly mimeType: string
  readonly size: number
  readonly base64: string
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}
