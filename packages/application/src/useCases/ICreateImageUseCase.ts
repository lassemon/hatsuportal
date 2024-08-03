import { IUseCase, IUseCaseOptions } from './IUseCase'
import { ImageDTO } from '../dtos/ImageDTO'
import { CreateImageInputDTO } from '../dtos/CreateImageInputDTO'

export interface ICreateImageUseCaseOptions extends IUseCaseOptions {
  createImageInput: CreateImageInputDTO
  imageCreated: (createImage: ImageDTO) => void
}

export type ICreateImageUseCase = IUseCase<ICreateImageUseCaseOptions>
