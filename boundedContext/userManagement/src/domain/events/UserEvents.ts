import { unixtimeNow } from '@hatsuportal/common'
import { User } from '../entities/User'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class UserCreatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'UserCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserUpdatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'UserUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserDeactivatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'UserDeactivated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserDeletedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'UserDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
