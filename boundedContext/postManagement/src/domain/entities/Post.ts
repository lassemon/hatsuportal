import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { Entity, EntityProps, IDomainEvent, IDomainEventHolder, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface PostProps extends EntityProps {
  readonly createdById: PostCreatorId
}

export abstract class Post extends Entity implements IDomainEventHolder<PostId, UnixTimestamp> {
  constructor(id: PostId, public readonly createdById: PostCreatorId, createdAt: UnixTimestamp, updatedAt: UnixTimestamp) {
    super(id, createdAt, updatedAt)
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof Post &&
      this.id.equals(other.id) &&
      this.createdById.equals(other.createdById) &&
      this.createdAt.equals(other.createdAt)
    )
  }

  public get domainEvents(): IDomainEvent<UnixTimestamp>[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent<UnixTimestamp>): void {
    this._domainEvents.push(event)
  }
}
