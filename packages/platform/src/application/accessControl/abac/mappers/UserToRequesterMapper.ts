import { UserRoleEnum } from '@hatsuportal/common'
import { IRequester } from '../types'

export interface IUserForAuthorization {
  id: string | null
  roles: UserRoleEnum[]
  active: boolean
  name: string
}

export interface IUserToRequesterMapper {
  fromSession(input: IUserForAuthorization | null): IRequester | null
}

export class UserToRequesterMapper implements IUserToRequesterMapper {
  public fromSession(input: IUserForAuthorization | null) {
    if (!input || !input.id) return null
    return { userId: input.id, roles: input.roles, attributes: { active: input.active }, name: input.name }
  }
}
