import { describe, expect, it } from 'vitest'
import { sampleImageId } from '../../__test__/testFactory'
import { Bio } from './Bio'
import { ProfileImageId } from './ProfileImageId'
import { StatusMessage } from './StatusMessage'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  const buildProfile = () =>
    UserProfile.reconstruct({
      bio: new Bio('Hello world'),
      statusMessage: new StatusMessage('Away'),
      profileImageId: ProfileImageId.NOT_SET
    })

  it('reconstruct creates user profile', () => {
    const profile = buildProfile()
    expect(profile).to.be.instanceOf(UserProfile)
    expect(profile.bio.value).to.eq('Hello world')
    expect(profile.statusMessage.value).to.eq('Away')
    expect(profile.profileImageId).toBe(ProfileImageId.NOT_SET)
  })

  it('withBio returns same instance when bio unchanged', () => {
    const profile = buildProfile()
    expect(profile.withBio(new Bio('Hello world'))).toBe(profile)
  })

  it('withBio returns new instance when bio changes', () => {
    const profile = buildProfile()
    const updated = profile.withBio(new Bio('Updated bio'))
    expect(updated).not.toBe(profile)
    expect(updated.bio.value).toBe('Updated bio')
  })

  it('withStatusMessage returns same instance when status unchanged', () => {
    const profile = buildProfile()
    expect(profile.withStatusMessage(new StatusMessage('Away'))).toBe(profile)
  })

  it('withStatusMessage returns new instance when status changes', () => {
    const profile = buildProfile()
    const updated = profile.withStatusMessage(new StatusMessage('Online'))
    expect(updated).not.toBe(profile)
    expect(updated.statusMessage.value).toBe('Online')
  })

  it('withProfileImage returns same instance when image unchanged', () => {
    const profile = buildProfile()
    expect(profile.withProfileImage(ProfileImageId.NOT_SET)).toBe(profile)
  })

  it('withProfileImage returns new instance when image changes', () => {
    const profile = buildProfile()
    const profileImageId = new ProfileImageId(sampleImageId)
    const updated = profile.withProfileImage(profileImageId)
    expect(updated).not.toBe(profile)
    expect(updated.profileImageId.value).toBe(sampleImageId)
  })

  it('clone creates equal copy', () => {
    const profile = buildProfile()
    const clone = profile.clone()
    expect(clone).not.toBe(profile)
    expect(clone.equals(profile)).toBe(true)
  })

  it('equals compares all fields', () => {
    const profile = buildProfile()
    const same = buildProfile()
    const different = profile.withBio(new Bio('Different bio'))
    expect(profile.equals(same)).toBe(true)
    expect(profile.equals(different)).toBe(false)
  })

  it('serialize returns plain object', () => {
    const profile = buildProfile()
    expect(profile.serialize()).toStrictEqual({
      bio: 'Hello world',
      statusMessage: 'Away',
      profileImageId: ProfileImageId.NOT_SET.value
    })
  })
})
