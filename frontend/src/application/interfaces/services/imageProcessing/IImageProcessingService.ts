export interface ImageProcessingOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  autoRotate?: boolean
  debug?: boolean
  mimeType?: 'image/png'
}

export interface IImageProcessingService {
  resizeImage(base64Image: string, resizeOptions: ImageProcessingOptions, callback: (base64Image: string) => void): void
}
