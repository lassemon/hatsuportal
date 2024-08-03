import { PartialExceptFor } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Theme, ThemeColors, ThemeId, ThemeName, UserId } from '../../domain'
import { ThemeDatabaseSchema } from '../schemas/ThemeDatabaseSchema'

export interface IThemeInfrastructureMapper {
  toThemeInsertRecord(theme: Theme): ThemeDatabaseSchema
  toThemeUpdateRecord(theme: Theme): PartialExceptFor<ThemeDatabaseSchema, 'id'>
  toDomainEntity(theme: ThemeDatabaseSchema): Theme
}

export class ThemeInfrastructureMapper implements IThemeInfrastructureMapper {
  toThemeInsertRecord(theme: Theme): ThemeDatabaseSchema {
    return {
      id: theme.id.value,
      name: theme.name.value,
      lightColors: theme.lightColors.serialize(),
      darkColors: theme.darkColors.serialize(),
      createdById: theme.createdById.value,
      createdAt: theme.createdAt.value,
      updatedAt: theme.updatedAt.value
    }
  }

  toThemeUpdateRecord(theme: Theme): PartialExceptFor<ThemeDatabaseSchema, 'id'> {
    return {
      id: theme.id.value,
      name: theme.name.value,
      lightColors: theme.lightColors.serialize(),
      darkColors: theme.darkColors.serialize(),
      updatedAt: theme.updatedAt.value
    }
  }

  toDomainEntity(theme: ThemeDatabaseSchema): Theme {
    return Theme.reconstruct({
      id: new ThemeId(theme.id),
      name: new ThemeName(theme.name),
      lightColors: ThemeColors.reconstruct(theme.lightColors),
      darkColors: ThemeColors.reconstruct(theme.darkColors),
      createdById: new UserId(theme.createdById),
      createdAt: new CreatedAtTimestamp(theme.createdAt),
      updatedAt: new UnixTimestamp(theme.updatedAt)
    })
  }
}
