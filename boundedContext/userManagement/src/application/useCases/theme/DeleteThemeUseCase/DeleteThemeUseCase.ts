import { ConflictError, ConcurrencyError, IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { UniqueId } from '@hatsuportal/shared-kernel'
import { IThemeRepository, Theme, ThemeId } from '../../../../domain'
import { DeleteThemeInputDTO } from '../../../dtos'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

export interface IDeleteThemeUseCaseOptions extends IUseCaseOptions {
  deletedById: string
  deleteThemeInput: DeleteThemeInputDTO
  themeDeleted: () => void
  deleteConflict: (error: ConcurrencyError<Theme>) => void
}

export type IDeleteThemeUseCase = IUseCase<IDeleteThemeUseCaseOptions>

export class DeleteThemeUseCase implements IDeleteThemeUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository,
    private readonly userReadRepository: IUserReadRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ deletedById, deleteThemeInput, themeDeleted, deleteConflict }: IDeleteThemeUseCaseOptions): Promise<void> {
    const themeId = new ThemeId(deleteThemeInput.themeIdToDelete)

    const userIds = await this.userReadRepository.findUserIdsBySelectedThemeId(themeId.value)
    if (userIds.length > 0) {
      throw new ConflictError(`Cannot delete theme: ${userIds.length} user(s) still have this theme selected.`)
    }

    const existingTheme = await this.themeRepository.findById(themeId)
    if (!existingTheme) {
      throw new NotFoundError(`Theme with id ${themeId.value} not found`)
    }

    try {
      await this.unitOfWork.execute(async () => {
        const themeToDelete = await this.themeRepository.findByIdForUpdate(themeId)
        if (!themeToDelete) {
          throw new NotFoundError(`Theme with id ${themeId.value} not found`)
        }

        const theme = themeToDelete.clone()
        theme.delete(new UniqueId(deletedById))
        await this.themeRepository.delete(theme)
        return [theme]
      })

      themeDeleted()
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        deleteConflict(error)
        return
      }
      throw error
    }
  }
}
