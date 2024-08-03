import { ICreateImageUseCase } from '../useCases/ICreateImageUseCase'
import { IFindImageUseCase } from '../useCases/IFindImageUseCase'
import { IUpdateImageUseCase } from '../useCases/IUpdateImageUseCase'

export interface IUseCaseFactory {
  createCreateImageUseCase(): ICreateImageUseCase
  createFindImageUseCase(): IFindImageUseCase
  createUpdateImageUseCase(): IUpdateImageUseCase
}
