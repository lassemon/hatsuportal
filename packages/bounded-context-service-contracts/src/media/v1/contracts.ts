export enum MediaKindContract {
  Image = 'Image',
  Video = 'Video'
}

export interface ImageContract {
  readonly id: string
  readonly kind: MediaKindContract.Image
  readonly storageKey: string
  readonly mimeType: string
  readonly size: number
  readonly base64: string
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}

export interface VideoContract {
  readonly id: string
  readonly kind: MediaKindContract.Video
  readonly storageKey: string
  readonly mimeType: string
  readonly size: number
  readonly createdById: string
  readonly createdAt: number
  readonly updatedAt: number
}

export type MediaContract = ImageContract | VideoContract
