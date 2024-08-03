export interface ReplyViewModelDTO {
  readonly id: string
  readonly authorId: string
  readonly authorName: string
  readonly body: string | null
  readonly isDeleted: boolean
  readonly createdAt: number
}

export class ReplyViewModel {
  private readonly _id: string
  private readonly _authorId: string
  private readonly _authorName: string
  private readonly _body: string | null
  private readonly _isDeleted: boolean
  private readonly _createdAt: number

  constructor(props: ReplyViewModelDTO) {
    this._id = props.id
    this._authorId = props.authorId
    this._authorName = props.authorName
    this._body = props.body
    this._isDeleted = props.isDeleted
    this._createdAt = props.createdAt
  }

  public get id(): string {
    return this._id
  }

  public get authorId(): string {
    return this._authorId
  }

  public get authorName(): string {
    return this._authorName
  }

  public get body(): string | null {
    return this._body
  }

  public get isDeleted(): boolean {
    return this._isDeleted
  }

  public get createdAt(): number {
    return this._createdAt
  }

  public toJSON(): ReplyViewModelDTO {
    return {
      id: this._id,
      authorId: this._authorId,
      authorName: this._authorName,
      body: this._body,
      isDeleted: this._isDeleted,
      createdAt: this._createdAt
    }
  }

  public clone(props?: Partial<ReplyViewModelDTO>): ReplyViewModel {
    if (props) {
      return new ReplyViewModel({ ...this.toJSON(), ...props })
    } else {
      return new ReplyViewModel(this.toJSON())
    }
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof ReplyViewModel &&
      this.id === other.id &&
      this.authorId === other.authorId &&
      this.authorName === other.authorName &&
      this.body === other.body &&
      this.isDeleted === other.isDeleted &&
      this.createdAt === other.createdAt
    )
  }
}
