import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import {
  CreatedAtTimestamp,
  DomainEvent,
  Entity,
  EntityProps,
  IDomainEventHolder,
  UniqueId,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { PostTitle } from '../valueObjects/PostTitle'
import { unixtimeNow } from '@hatsuportal/common'

export interface PostProps extends EntityProps {
  readonly title: PostTitle
  readonly visibility: PostVisibility
  readonly createdById: PostCreatorId
}

export abstract class Post extends Entity implements IDomainEventHolder {
  private _title: PostTitle
  private _visibility: PostVisibility

  constructor(
    id: PostId,
    readonly __title: PostTitle,
    readonly __visibility: PostVisibility,
    public readonly createdById: PostCreatorId,
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)
    this._title = __title
    this._visibility = __visibility
  }

  public get title(): PostTitle {
    return this._title
  }

  public get visibility(): PostVisibility {
    return this._visibility
  }

  public rename(title: PostTitle, updatedById: UniqueId): void {
    this._title = title
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public updateVisibility(visibility: PostVisibility, updatedById: UniqueId): void {
    this._visibility = visibility
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof Post &&
      this.id.equals(other.id) &&
      this.title.equals(other.title) &&
      this.visibility.equals(other.visibility) &&
      this.createdById.equals(other.createdById) &&
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
