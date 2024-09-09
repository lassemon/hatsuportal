import { ImageDTO, User } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'
import { CreateImageRequestDTO } from '../api/requests/CreateImageRequestDTO'

export interface ICreateImageUseCaseOptions extends IUseCaseOptions {
  user: User
  createImageRequest: CreateImageRequestDTO
}

export type ICreateImageUseCase = IUseCase<ICreateImageUseCaseOptions, ImageDTO>
