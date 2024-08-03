import { ICreateStagedImageVersionUseCase } from '../useCases/CreateStagedImageVersionUseCase/CreateStagedImageVersionUseCase'
import { IDeleteImageUseCase } from '../useCases/DeleteImageUseCase/DeleteImageUseCase'
import { IFindImageUseCase } from '../useCases/FindImageUseCase/FindImageUseCase'
import { IPromoteImageVersionUseCase } from '../useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCase'
export interface IUseCaseFactory {
  createCreateStagedImageVersionUseCase(): ICreateStagedImageVersionUseCase
  createPromoteImageVersionUseCase(): IPromoteImageVersionUseCase
  createDeleteImageUseCase(): IDeleteImageUseCase
  createFindImageUseCase(): IFindImageUseCase
}
