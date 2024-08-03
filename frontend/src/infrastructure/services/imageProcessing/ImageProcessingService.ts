import { IImageProcessingService, ImageProcessingOptions } from 'application/interfaces'

const defaultOptions = {
  maxWidth: 320,
  maxHeight: 320
}

export class ImageProcessingService implements IImageProcessingService {
  resizeImage(base64Image: string, resizeOptions: ImageProcessingOptions, callback: (base64Image: string) => void) {
    const options = { ...defaultOptions, ...resizeOptions }

    var img = new Image()
    img.src = base64Image

    if (img.naturalWidth > img.naturalHeight) {
      options.maxHeight = 480
    }

    // When the event "onload" is triggered we can resize the image.
    img.onload = function () {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')

      let ratio = Math.min(options.maxWidth / img.width, options.maxHeight / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL()
      callback(dataUrl)
    }
  }
}
