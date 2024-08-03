import { Maybe } from '@hatsuportal/common'
import { InvalidProfileImageIdError } from '../errors/InvalidProfileImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class ProfileImageId extends UniqueId {
  public static readonly NOT_SET = new ProfileImageId(UniqueId.UNKNOWN.value)

  static override canCreate(value: string): boolean {
    try {
      ProfileImageId.assertCanCreate(value)
      return true
    } catch {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new ProfileImageId(value)
  }

  static fromOptional(value: Maybe<ProfileImageId> | string): ProfileImageId {
    if (!value || ProfileImageId.NOT_SET.equals(value)) {
      return ProfileImageId.NOT_SET
    }
    return value instanceof ProfileImageId ? value : new ProfileImageId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidProfileImageIdError(error)
    }
  }
}
