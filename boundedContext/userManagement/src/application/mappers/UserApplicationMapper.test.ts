import { describe, expect, it } from 'vitest'
import { UserApplicationMapper } from './UserApplicationMapper'

describe('UserApplicationMapper', () => {
  const userMapper = new UserApplicationMapper()

  it('converts user entity to dto', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const result = userMapper.toDTO(user)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.userDTOMock())
  })

  it('maps profile fields from read model', ({ unitFixture }) => {
    const readModel = unitFixture.userReadModelDTOMock({ bio: 'Bio text', statusMessage: 'Away' })
    expect(userMapper.profileDTOFromReadModel(readModel)).toStrictEqual({
      bio: 'Bio text',
      statusMessage: 'Away',
      profileImageId: readModel.profileImageId
    })
  })

  it('maps preferences fields from read model', ({ unitFixture }) => {
    const readModel = unitFixture.userReadModelDTOMock()
    expect(userMapper.preferencesDTOFromReadModel(readModel)).toStrictEqual({
      colorScheme: readModel.colorScheme,
      selectedThemeId: readModel.selectedThemeId,
      notificationSettings: readModel.notificationSettings
    })
  })
})
