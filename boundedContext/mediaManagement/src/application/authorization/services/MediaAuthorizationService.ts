import { IAuthorizationDecision, createAbacEngine, IUserToRequesterMapper, IAuthorizationEngine } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import {
  CreateImageAuthorizationAttributes,
  DeleteImageAuthorizationAttributes,
  MediaAction,
  MediaResourceType,
  mediaRules,
  UpdateImageAuthorizationAttributes
} from '../rules/media.rules'
import { ImageDTO } from '../../dtos'

export interface IMediaAuthorizationService {
  canCreateImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }): IAuthorizationDecision
  canUpdateImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }, image: ImageDTO): IAuthorizationDecision
  canDeleteImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }, image: ImageDTO): IAuthorizationDecision
}

export class MediaAuthorizationService implements IMediaAuthorizationService {
  private readonly mediaAbacEngine: IAuthorizationEngine

  constructor(private readonly requesterMapper: IUserToRequesterMapper) {
    this.mediaAbacEngine = createAbacEngine(mediaRules)
  }

  public canCreateImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }) {
    return this.mediaAbacEngine.evaluate<CreateImageAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: MediaAction.Create
    })
  }

  public canUpdateImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }, image: ImageDTO) {
    return this.mediaAbacEngine.evaluate<UpdateImageAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: MediaAction.Update,
      resource: { type: MediaResourceType.Image, id: image.id.toString(), attributes: { image } }
    })
  }

  public canDeleteImage(user: { id: string | null; roles: UserRoleEnum[]; active: boolean }, image: ImageDTO) {
    return this.mediaAbacEngine.evaluate<DeleteImageAuthorizationAttributes>({
      requester: this.requesterMapper.fromSession(user),
      action: MediaAction.Delete,
      resource: {
        type: MediaResourceType.Image,
        id: image.id.toString(),
        attributes: { image }
      }
    })
  }
}
