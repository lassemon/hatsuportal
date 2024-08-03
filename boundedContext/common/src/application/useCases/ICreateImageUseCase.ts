import { CreateImageInputDTO } from '../dtos/CreateImageInputDTO'
import { ImageDTO } from '../dtos/ImageDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface ICreateImageUseCaseOptions extends IUseCaseOptions {
  createImageInput: CreateImageInputDTO
  imageCreated: (createImage: ImageDTO) => void
}

export type ICreateImageUseCase = IUseCase<ICreateImageUseCaseOptions>
