import { NonEmptyString } from '@hatsuportal/shared-kernel'

export interface CommentCursorProps {
  parentId: string | null
  createdAt: number
  id: string
}

export class CommentCursor extends NonEmptyString {
  static toCursor(cursor: CommentCursorProps) {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url')
  }

  static fromCursorStringToProps(cursorString: string): CommentCursorProps {
    return JSON.parse(Buffer.from(cursorString, 'base64url').toString('utf8')) as CommentCursorProps
  }

  static fromCursorString(cursorString: string): CommentCursor {
    const props = CommentCursor.fromCursorStringToProps(cursorString)
    return new CommentCursor(props.parentId, props.createdAt, props.id)
  }

  constructor(public readonly parentId: string | null, public readonly createdAt: number, public readonly id: string) {
    super(CommentCursor.toCursor({ parentId, createdAt, id }))
  }

  override equals(other: unknown): boolean {
    return other instanceof CommentCursor && this.value === other.value
  }
}
