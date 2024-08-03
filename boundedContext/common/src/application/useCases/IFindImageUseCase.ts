import { ImageDTO } from '../dtos/ImageDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IFindImageUseCaseOptions extends IUseCaseOptions {
  imageId: string
  imageFound: (image: ImageDTO) => void
}

export type IFindImageUseCase = IUseCase<IFindImageUseCaseOptions>
