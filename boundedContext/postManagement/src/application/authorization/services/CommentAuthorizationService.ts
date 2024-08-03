import {
  IAuthorizationDecision,
  IAuthorizationEngine,
  IUserForAuthorization,
  IUserToRequesterMapper,
  AuthorizationServiceBase
} from '@hatsuportal/platform'
import { CommentDTO, PostDTO } from '../../dtos'
import { CommentAction, CommentAuthorizationPayloadMap } from '../rules/comment.rules'

export interface ICommentAuthorizationService {
  canAddComment(user: IUserForAuthorization, post: PostDTO): IAuthorizationDecision
  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: CommentDTO): IAuthorizationDecision
  canEditComment(user: IUserForAuthorization, comment: CommentDTO): IAuthorizationDecision
  canSoftDeleteComment(user: IUserForAuthorization, comment: CommentDTO): IAuthorizationDecision
  canHardDeleteComment(user: IUserForAuthorization, comment: CommentDTO): IAuthorizationDecision
}

export class CommentAuthorizationService
  extends AuthorizationServiceBase<CommentAction, CommentAuthorizationPayloadMap>
  implements ICommentAuthorizationService
{
  constructor(
    requesterMapper: IUserToRequesterMapper,
    engine: IAuthorizationEngine<CommentAction, CommentAuthorizationPayloadMap>
  ) {
    super(requesterMapper, engine)
  }

  canAddComment(user: IUserForAuthorization, post: PostDTO) {
    return this.authorize(CommentAction.Add, user, { post })
  }

  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: CommentDTO): IAuthorizationDecision {
    return this.authorize(CommentAction.AddReply, user, {
      post,
      parentComment
    })
  }

  canEditComment(user: IUserForAuthorization, comment: CommentDTO) {
    return this.authorize(CommentAction.Edit, user, { comment })
  }

  canSoftDeleteComment(user: IUserForAuthorization, comment: CommentDTO) {
    return this.authorize(CommentAction.SoftDelete, user, { comment })
  }

  canHardDeleteComment(user: IUserForAuthorization, comment: CommentDTO) {
    return this.authorize(CommentAction.HardDelete, user, { comment })
  }
}
