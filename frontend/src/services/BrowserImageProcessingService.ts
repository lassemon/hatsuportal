import { BrowserImageProcessingOptions, BrowserImageProcessingServiceInterface } from '@hatsuportal/application'

const defaultOptions = {
  maxWidth: 320,
  maxHeight: 320
}

export class BrowserImageProcessingService implements BrowserImageProcessingServiceInterface {
  resizeImage(base64Image: string, resizeOptions: BrowserImageProcessingOptions, callback: (base64Image: string) => void) {
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
