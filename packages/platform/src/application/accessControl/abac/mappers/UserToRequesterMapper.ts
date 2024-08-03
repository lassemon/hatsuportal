import { UserRoleEnum } from '@hatsuportal/common'
import { IRequester } from '../types'

export interface IUserToRequesterMapper {
  fromSession(input: { id: string | null; roles: UserRoleEnum[]; active: boolean } | null): IRequester | null
}

export class UserToRequesterMapper implements IUserToRequesterMapper {
  public fromSession(input: { id: string | null; roles: UserRoleEnum[]; active: boolean; name: string } | null) {
    if (!input || !input.id) return null
    return { userId: input.id, roles: input.roles, attributes: { active: input.active }, name: input.name }
  }
}
