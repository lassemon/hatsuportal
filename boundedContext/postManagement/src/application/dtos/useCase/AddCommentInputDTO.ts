export enum AddCommentTargetKind {
  TopLevel = 'TopLevel',
  Reply = 'Reply'
}

export type AddCommentTarget =
  | { kind: AddCommentTargetKind.TopLevel; postId: string }
  | { kind: AddCommentTargetKind.Reply; parentCommentId: string }

export const isTopLevelTarget = (target: AddCommentTarget): target is { kind: AddCommentTargetKind.TopLevel; postId: string } => {
  return target.kind === AddCommentTargetKind.TopLevel
}

export const isReply = (target: AddCommentTarget): target is { kind: AddCommentTargetKind.Reply; parentCommentId: string } => {
  return target.kind === AddCommentTargetKind.Reply
}

export interface AddCommentInputDTO {
  postId: string
  parentCommentId?: string
  body: string
  authorId: string
  target: AddCommentTarget
}
