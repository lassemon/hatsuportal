import { DomainError, EntityFactoryResult, Image, ImageProps } from '../../domain'

export interface IImageFactory {
  createImage(props: ImageProps): EntityFactoryResult<Image, DomainError>
}
