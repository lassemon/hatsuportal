import { DomainError, EntityFactoryResult, Image, ImageProps } from '../../domain'

export interface IImageFactory {
  createImage(props: ImageProps): EntityFactoryResult<Image, DomainError>
}

export class ImageFactory implements IImageFactory {
  createImage(props: ImageProps): EntityFactoryResult<Image, DomainError> {
    try {
      const image = Image.create(props)
      return EntityFactoryResult.ok(image)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }

      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating image',
          cause: error
        })
      )
    }
  }
}
