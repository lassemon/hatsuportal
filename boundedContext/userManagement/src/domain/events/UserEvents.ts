import { unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { User } from '../entities/User'

export class UserCreatedEvent implements IDomainEvent {
  readonly eventType = 'UserCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserUpdatedEvent implements IDomainEvent {
  readonly eventType = 'UserUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserDeactivatedEvent implements IDomainEvent {
  readonly eventType = 'UserDeactivated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserDeletedEvent implements IDomainEvent {
  readonly eventType = 'UserDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
