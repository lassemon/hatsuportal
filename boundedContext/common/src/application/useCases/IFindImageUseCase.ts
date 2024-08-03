import { IUseCase, IUseCaseOptions } from './IUseCase'
import { ImageDTO } from '../dtos/ImageDTO'

export interface IFindImageUseCaseOptions extends IUseCaseOptions {
  imageId: string
  imageFound: (image: ImageDTO) => void
}

export type IFindImageUseCase = IUseCase<IFindImageUseCaseOptions>
