import { IAuthorizationDecision, IUserForAuthorization, AuthorizationServiceBase } from '@hatsuportal/platform'
import { MediaAction, MediaAuthorizationPayloadMap } from '../rules/media.rules'
import { ImageDTO } from '../../dtos'

export interface IMediaAuthorizationService {
  canCreateImage(user: IUserForAuthorization): IAuthorizationDecision
  canUpdateImage(user: IUserForAuthorization, image: ImageDTO): IAuthorizationDecision
  canDeleteImage(user: IUserForAuthorization, image: ImageDTO): IAuthorizationDecision
}

export class MediaAuthorizationService
  extends AuthorizationServiceBase<MediaAction, MediaAuthorizationPayloadMap>
  implements IMediaAuthorizationService
{
  canCreateImage(user: IUserForAuthorization) {
    return this.authorize(MediaAction.Create, user)
  }

  canUpdateImage(user: IUserForAuthorization, image: ImageDTO) {
    return this.authorize(MediaAction.Update, user, { image })
  }

  canDeleteImage(user: IUserForAuthorization, image: ImageDTO) {
    return this.authorize(MediaAction.Delete, user, { image })
  }
}
