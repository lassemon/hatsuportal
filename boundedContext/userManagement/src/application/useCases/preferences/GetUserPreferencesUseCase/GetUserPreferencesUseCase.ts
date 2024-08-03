import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { UserId } from '../../../../domain'
import { PreferencesDTOWithTheme } from '../../../dtos'
import { IPreferencesLookupService } from '../../../services/PreferencesLookupService'

export interface IGetUserPreferencesUseCaseOptions extends IUseCaseOptions {
  loggedInUserId: string
  userId: string
  userPreferences: (preferences: PreferencesDTOWithTheme) => void
}

export type IGetUserPreferencesUseCase = IUseCase<IGetUserPreferencesUseCaseOptions>

export class GetUserPreferencesUseCase implements IGetUserPreferencesUseCase {
  constructor(private readonly preferencesLookupService: IPreferencesLookupService) {}

  async execute({ userId, userPreferences }: IGetUserPreferencesUseCaseOptions): Promise<void> {
    const preferences = await this.preferencesLookupService.findByUserId(new UserId(userId))
    if (!preferences) {
      throw new NotFoundError(`User with id ${userId} not found`)
    }
    userPreferences(preferences)
  }
}
