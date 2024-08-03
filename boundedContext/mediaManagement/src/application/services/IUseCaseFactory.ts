import { ICreateImageUseCase } from '../useCases/CreateImageUseCase/CreateImageUseCase'
import { ICreateStagedImageVersionUseCase } from '../useCases/CreateStagedImageVersionUseCase/CreateStagedImageVersionUseCase'
import { IDeleteImageUseCase } from '../useCases/DeleteImageUseCase/DeleteImageUseCase'
import { IDiscardImageVersionUseCase } from '../useCases/DiscardImageVersionUseCase/DiscardImageVersionUseCase'
import { IFindImageUseCase } from '../useCases/FindImageUseCase/FindImageUseCase'
import { IPromoteImageVersionUseCase } from '../useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCase'
import { IUpdateImageUseCase } from '../useCases/UpdateImageUseCase/UpdateImageUseCase'

export interface IUseCaseFactory {
  createCreateImageUseCase(): ICreateImageUseCase
  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase
  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase
  createDiscardImageVersionUseCase(): IDiscardImageVersionUseCase
  createDeleteImageUseCase(): IDeleteImageUseCase
  createFindImageUseCase(): IFindImageUseCase
  createUpdateImageUseCase(): IUpdateImageUseCase
}
