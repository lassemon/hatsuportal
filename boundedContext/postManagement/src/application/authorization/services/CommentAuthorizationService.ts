import {
  IAuthorizationDecision,
  IAuthorizationEngine,
  IUserForAuthorization,
  IUserToRequesterMapper,
  AuthorizationServiceBase
} from '@hatsuportal/platform'
import { PostDTO } from '../../dtos'
import { ICommentApplicationMapper } from '../../mappers/CommentApplicationMapper'
import { CommentAction, CommentAuthorizationPayloadMap } from '../rules/comment.rules'
import { Comment } from '../../../domain'

export interface ICommentAuthorizationService {
  canAddComment(user: IUserForAuthorization, post: PostDTO): IAuthorizationDecision
  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: Comment): IAuthorizationDecision
  canEditComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
  canSoftDeleteComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
  canHardDeleteComment(user: IUserForAuthorization, comment: Comment): IAuthorizationDecision
}

export class CommentAuthorizationService
  extends AuthorizationServiceBase<CommentAction, CommentAuthorizationPayloadMap>
  implements ICommentAuthorizationService
{
  constructor(
    private readonly commentMapper: ICommentApplicationMapper,
    requesterMapper: IUserToRequesterMapper,
    engine: IAuthorizationEngine<CommentAction, CommentAuthorizationPayloadMap>
  ) {
    super(requesterMapper, engine)
  }

  canAddComment(user: IUserForAuthorization, post: PostDTO) {
    return this.authorize(CommentAction.Add, user, { post })
  }

  canAddReply(user: IUserForAuthorization, post: PostDTO, parentComment: Comment): IAuthorizationDecision {
    return this.authorize(CommentAction.AddReply, user, {
      post,
      parentComment: this.commentMapper.toDTO(parentComment)
    })
  }

  canEditComment(user: IUserForAuthorization, comment: Comment) {
    return this.authorize(CommentAction.Edit, user, { comment: this.commentMapper.toDTO(comment) })
  }

  canSoftDeleteComment(user: IUserForAuthorization, comment: Comment) {
    return this.authorize(CommentAction.SoftDelete, user, { comment: this.commentMapper.toDTO(comment) })
  }

  canHardDeleteComment(user: IUserForAuthorization, comment: Comment) {
    return this.authorize(CommentAction.HardDelete, user, { comment: this.commentMapper.toDTO(comment) })
  }
}
