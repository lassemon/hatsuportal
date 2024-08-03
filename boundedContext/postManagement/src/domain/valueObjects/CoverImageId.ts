import { Maybe } from '@hatsuportal/common'
import { InvalidCoverImageIdError } from '../errors/InvalidCoverImageIdError'
import { UniqueId } from '@hatsuportal/shared-kernel'

export class CoverImageId extends UniqueId {
  public static readonly NOT_SET = new CoverImageId(UniqueId.UNKNOWN.value)

  static override canCreate(value: string): boolean {
    try {
      CoverImageId.assertCanCreate(value)
      return true
    } catch (error) {
      return false
    }
  }

  static override assertCanCreate(value: string): void {
    new CoverImageId(value)
  }

  static fromOptional(value: Maybe<CoverImageId> | string): CoverImageId {
    if (!value || CoverImageId.NOT_SET.equals(value)) {
      return CoverImageId.NOT_SET
    }
    return value instanceof CoverImageId ? value : new CoverImageId(value)
  }

  constructor(value: string) {
    try {
      super(value)
    } catch (error) {
      throw new InvalidCoverImageIdError(error)
    }
  }
}
