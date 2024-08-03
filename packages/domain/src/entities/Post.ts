import { PostId } from '../valueObjects/PostId'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { UserName } from '../valueObjects/UserName'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { VisibilityEnum } from '@hatsuportal/common'
import { DomainEvent } from '../events/DomainEvent'
import { UserId } from '../valueObjects/UserId'

export interface PostProps {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdBy: string
  readonly createdByUserName: string
  readonly createdAt: number
  updatedAt: number | null
}

export abstract class Post<E extends PostProps> {
  protected _id: PostId
  protected _visibility: PostVisibility
  protected _createdBy: UserId
  protected _createdByUserName: UserName
  protected _createdAt: UnixTimestamp
  protected _updatedAt: UnixTimestamp | null

  protected _domainEvents: DomainEvent[] = []

  abstract getProps(): PostProps
  abstract update(props: Partial<E>): void
  abstract delete(): void

  constructor(props: E) {
    this._id = new PostId(props.id)
    this._visibility = new PostVisibility(props.visibility)
    this._createdBy = new UserId(props.createdBy)
    this._createdByUserName = new UserName(props.createdByUserName)
    this._createdAt = new UnixTimestamp(props.createdAt)
    this._updatedAt = props.updatedAt ? new UnixTimestamp(props.updatedAt) : null
  }

  get id(): PostId {
    return this._id
  }

  get visibility(): PostVisibility {
    return this._visibility
  }

  set visibility(visibility: VisibilityEnum) {
    this._visibility = new PostVisibility(visibility)
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get createdByUserName(): UserName {
    return this._createdByUserName
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp | null {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    this._updatedAt = updatedAt ? new UnixTimestamp(updatedAt) : null
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof Post &&
      this.id.equals(other.id) &&
      this.visibility.equals(other.visibility) &&
      this.createdBy.equals(other.createdBy) &&
      this.createdByUserName.equals(other.createdByUserName) &&
      this.createdAt.equals(other.createdAt)
    )
  }

  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }
}
