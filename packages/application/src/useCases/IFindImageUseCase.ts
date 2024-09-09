import { ImageDTO } from '@hatsuportal/domain'
import { IUseCase, IUseCaseOptions } from './IUseCase'

export interface IFindImageUseCaseOptions extends IUseCaseOptions {
  imageId: string
}

export type IFindImageUseCase = IUseCase<IFindImageUseCaseOptions, ImageDTO>
