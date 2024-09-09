import { ImageDTO } from '@hatsuportal/domain'
import { UpdateImageRequestDTO } from '../api/requests/UpdateImageRequestDTO'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IUpdateImageUseCaseOptions extends IUseCaseOptions {
  updateImageRequest: UpdateImageRequestDTO
  previousFileName?: string
}

export type IUpdateImageUseCase = IUseCase<IUpdateImageUseCaseOptions, ImageDTO>
