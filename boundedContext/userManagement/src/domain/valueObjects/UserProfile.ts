import { CompositeValueObject } from '@hatsuportal/shared-kernel'
import { ProfileImageId } from './ProfileImageId'
import { StatusMessage } from './StatusMessage'
import { Bio } from './Bio'

export interface UserProfileProps {
  bio: Bio
  statusMessage: StatusMessage
  profileImageId: ProfileImageId
}

export class UserProfile extends CompositeValueObject {
  private constructor(
    readonly bio: Bio,
    readonly statusMessage: StatusMessage,
    readonly profileImageId: ProfileImageId
  ) {
    super()
  }

  static reconstruct(props: UserProfileProps): UserProfile {
    return new UserProfile(props.bio, props.statusMessage, props.profileImageId)
  }

  withBio(bio: Bio): UserProfile {
    if (bio.equals(this.bio)) return this
    return new UserProfile(bio, this.statusMessage, this.profileImageId)
  }

  withStatusMessage(statusMessage: StatusMessage): UserProfile {
    if (statusMessage.equals(this.statusMessage)) return this
    return new UserProfile(this.bio, statusMessage, this.profileImageId)
  }

  withProfileImage(profileImageId: ProfileImageId): UserProfile {
    if (profileImageId.equals(this.profileImageId)) return this
    return new UserProfile(this.bio, this.statusMessage, profileImageId)
  }

  clone(): UserProfile {
    return new UserProfile(this.bio, this.statusMessage, this.profileImageId)
  }

  equals(other: unknown): boolean {
    return (
      other instanceof UserProfile &&
      this.bio.equals(other.bio) &&
      this.statusMessage.equals(other.statusMessage) &&
      this.profileImageId.equals(other.profileImageId)
    )
  }

  serialize(): Record<string, unknown> {
    return {
      bio: this.bio.value,
      statusMessage: this.statusMessage.value,
      profileImageId: this.profileImageId.value
    }
  }
}
