import { useEffect, useRef, useState } from 'react'
import { UpdateParam } from 'state/itemAtom'
import { StorageSyncError } from 'domain/errors/StorageError'
import { uuid } from '@hatsuportal/common'
import { Image } from '@hatsuportal/domain'
import { ImageApiServiceInterface } from 'infrastructure/repositories/ImageApiServiceInterface'
import { BrowserImageProcessingService } from 'services/BrowserImageProcessingService'

type UseImageReturn = [
  { loading: boolean; image: Image | null | undefined; error?: any },
  (update: UpdateParam<Image | null | undefined>) => void,
  () => void
]

const DEBUG = false
const imageProcessingService = new BrowserImageProcessingService()

const useImage = (imageApiRepository: ImageApiServiceInterface, imageId?: string | null): UseImageReturn => {
  const controllerRef = useRef<AbortController | null>(null)

  const [image, setImage] = useState<Image | null | undefined>(null)
  const [error, setError] = useState<any>(null)
  const [reloadTrigger, setReloadTrigger] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAndSetImage = async (_imageId: string) => {
      DEBUG && console.log('useImage - fetchAndSetImage')
      if (isLoading) {
        return
      } else {
        try {
          setIsLoading(true)
          const controller = new AbortController()
          controllerRef.current = controller

          DEBUG && console.log('useImage - fetching', _imageId)
          const fetchedImage = await Promise.resolve(imageApiRepository.findById(_imageId, { signal: controller.signal }))
          DEBUG && console.log('useImage - fetchedImage', fetchedImage)
          setIsLoading(false)

          setImage(new Image(fetchedImage))
        } catch (error) {
          setIsLoading(false)
          setError(error)
        }
      }
    }

    const imageIdExists = !!imageId
    const imageExists = !!image
    const isTempImage = imageId?.startsWith('temp-')
    const shouldFetchImage = (!isTempImage && imageIdExists) || (!isTempImage && imageIdExists && !imageExists)

    DEBUG && console.log('\n\n====')
    DEBUG && console.log('useImage - imageId', imageId)
    DEBUG && console.log('useImage - imageIdExists', imageIdExists)
    DEBUG && console.log('useImage - imageExists', imageExists)
    DEBUG && console.log('useImage - isTempImage', isTempImage)
    DEBUG && console.log('useImage - image', image)
    DEBUG && console.log('useImage - shouldFetchImage', shouldFetchImage)
    DEBUG && console.log('===\n\n')

    if (shouldFetchImage) {
      fetchAndSetImage(imageId)
    }

    return () => {
      DEBUG && console.log('useImage ABORTING', imageId)
      controllerRef?.current?.abort()
    }
  }, [imageId, reloadTrigger])

  DEBUG && console.log('image', image)

  const imageState = {
    loading: isLoading,
    image: imageId === image?.id ? image : null,
    ...(error ? { error: error } : {})
  }

  const imageSetter = (update: UpdateParam<Image | null | undefined>) => {
    let parsedValue = update instanceof Function ? update(image) : update
    try {
      imageProcessingService.resizeImage(parsedValue?.base64 || '', { maxWidth: 320 }, (base64Image: string) => {
        if (parsedValue) {
          parsedValue.base64 = base64Image
        }
        setImage(parsedValue)
      })
    } catch (error: any) {
      setError(new StorageSyncError('Saving image failed: ' + error.message))
    }
  }

  const reloadImage = () => {
    setReloadTrigger(uuid())
  }

  return [imageState, imageSetter, reloadImage]
}

export default useImage
