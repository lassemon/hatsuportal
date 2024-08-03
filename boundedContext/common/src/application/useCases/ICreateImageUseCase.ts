import { IUseCase, IUseCaseOptions } from './IUseCase'
import { CreateImageInputDTO } from '../dtos/CreateImageInputDTO'
import { ImageDTO } from '../dtos/ImageDTO'

export interface ICreateImageUseCaseOptions extends IUseCaseOptions {
  createImageInput: CreateImageInputDTO
  imageCreated: (createImage: ImageDTO) => void
}

export type ICreateImageUseCase = IUseCase<ICreateImageUseCaseOptions>
