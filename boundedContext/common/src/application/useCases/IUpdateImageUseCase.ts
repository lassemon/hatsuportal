import { ConcurrencyError, Image } from '../..'
import { ImageDTO } from '../dtos/ImageDTO'
import { UpdateImageInputDTO } from '../dtos/UpdateImageInputDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IUpdateImageUseCaseOptions extends IUseCaseOptions {
  updateImageInput: UpdateImageInputDTO
  imageUpdated: (updatedImage: ImageDTO) => void
  updateConflict: (error: ConcurrencyError<Image>) => void
}

export type IUpdateImageUseCase = IUseCase<IUpdateImageUseCaseOptions>
