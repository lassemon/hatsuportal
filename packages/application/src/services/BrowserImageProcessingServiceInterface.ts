export interface BrowserImageProcessingOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  autoRotate?: boolean
  debug?: boolean
  mimeType?: 'image/png'
}

export interface BrowserImageProcessingServiceInterface {
  resizeImage(base64Image: string, resizeOptions: BrowserImageProcessingOptions, callback: (base64Image: string) => void): void
}
