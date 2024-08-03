import { Image } from '../../domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { ConcurrencyError } from '../../infrastructure'
import { ImageDTO } from '../dtos/ImageDTO'
import { UpdateImageInputDTO } from '../dtos/UpdateImageInputDTO'

export interface IUpdateImageUseCaseOptions extends IUseCaseOptions {
  updateImageInput: UpdateImageInputDTO
  imageUpdated: (updatedImage: ImageDTO) => void
  updateConflict: (error: ConcurrencyError<Image>) => void
}

export type IUpdateImageUseCase = IUseCase<IUpdateImageUseCaseOptions>
