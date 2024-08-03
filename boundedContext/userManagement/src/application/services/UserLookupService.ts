import { UserId } from '../../domain'
import { IUserReadRepository } from '../read/IUserReadRepository'

export interface IUserLookupService {
  invalidateById(userId: UserId): void
}

export class UserLookupService implements IUserLookupService {
  constructor(private readonly userReadRepository: IUserReadRepository) {}

  invalidateById(userId: UserId): void {
    this.userReadRepository.invalidateById(userId)
  }
}
