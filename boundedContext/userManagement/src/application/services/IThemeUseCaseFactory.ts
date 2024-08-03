import { ICreateThemeUseCase } from '../useCases/theme/CreateThemeUseCase'
import { IDeleteThemeUseCase } from '../useCases/theme/DeleteThemeUseCase'
import { IListThemesUseCase } from '../useCases/theme/ListThemesUseCase'
import { IUpdateThemeUseCase } from '../useCases/theme/UpdateThemeUseCase'

export interface IThemeUseCaseFactory {
  createListThemesUseCase(): IListThemesUseCase
  createCreateThemeUseCase(): ICreateThemeUseCase
  createUpdateThemeUseCase(): IUpdateThemeUseCase
  createDeleteThemeUseCase(): IDeleteThemeUseCase
}
