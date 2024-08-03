import { useEffect, useRef, useState } from 'react'
import { UpdateParam } from 'ui/state/atomWithAsyncStorage'
import { ImageViewModel } from 'ui/features/image/viewModels/ImageViewModel'
import { StorageSyncError } from 'infrastructure/errors/StorageSyncError'
import { useUtilityServiceContext } from 'infrastructure/hooks/useUtilityServiceContext'
import { IImageService } from 'application/interfaces'
import { uuid } from '@hatsuportal/common'

type UseImageReturn = [
  { loading: boolean; image: ImageViewModel | null | undefined; error?: any },
  (update: UpdateParam<ImageViewModel | null | undefined>) => void,
  () => void
]

const DEBUG = false

// TODO, this whole hook is a mess, it should be refactored to be more readable and maintainable
export const useImage = (imageService: IImageService, imageId?: string | null): UseImageReturn => {
  const utilityServiceContext = useUtilityServiceContext()
  const controllerRef = useRef<AbortController | null>(null)

  const [image, setImage] = useState<ImageViewModel | null | undefined>(null)
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
          const fetchedImage = await Promise.resolve(imageService.findById(_imageId, { signal: controller.signal }))
          DEBUG && console.log('useImage - fetchedImage', fetchedImage)
          setIsLoading(false)

          setImage(fetchedImage)
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

  const imageSetter = (update: UpdateParam<ImageViewModel | null | undefined>) => {
    let parsedValue = update instanceof Function ? update(image) : update
    try {
      utilityServiceContext.imageProcessingService.resizeImage(parsedValue?.base64 || '', { maxWidth: 320 }, (base64Image: string) => {
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
