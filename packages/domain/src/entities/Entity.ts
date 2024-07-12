import { isArray } from 'lodash'
import { Visibility } from '../enums/Visibility'
import AbstractEntity, { EntityDTO } from './AbstractEntity'
import { capitalize } from 'lodash'

export class Entity<E extends EntityDTO> extends AbstractEntity<E> {
  constructor(props: E) {
    super(props)
    this.validateProps(props)
  }

  private validateProps(props: E) {
    const allowedKeys = this.getAllowedKeys()
    const extraKeys = Object.keys(props).filter((key) => !allowedKeys.includes(key as keyof E))
    if (extraKeys.length > 0) {
      throw new Error(`Props contain extra keys: ${extraKeys.join(', ')}.`)
    }
  }

  protected getAllowedKeys(): (keyof E)[] {
    return ['id', 'visibility', 'createdBy', 'createdByUserName', 'createdAt', 'updatedAt'] as (keyof E)[]
  }

  get id(): string {
    return this.props.id
  }

  get visibility(): `${Visibility}` {
    return this.props.visibility
  }

  set visibility(visibility: `${Visibility}`) {
    this.props.visibility = visibility
  }

  get createdBy(): string {
    return this.props.createdBy
  }

  get createdByUserName(): string {
    return this.props.createdByUserName
  }

  get createdAt(): number {
    return this.props.createdAt
  }

  get updatedAt(): number | null {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    this.props.updatedAt = updatedAt
  }

  public get visibility_label() {
    return this.props.visibility
      ?.replaceAll('_', ' ')
      ?.split(' ')
      ?.map((part) => capitalize(part))
      ?.join(' ')
  }

  isEqual(otherEntity: this | object | null): boolean {
    if (otherEntity === null) {
      return false
    }
    return JSON.stringify(this) === JSON.stringify(otherEntity)
  }

  public clone<C extends this>(props?: Partial<E>): C {
    if (props) {
      const cloneProps = {
        ...this.props,
        ...props
      }
      return new (this.constructor as { new (props: E): C })(cloneProps as E)
    } else {
      return new (this.constructor as { new (props: E): C })(this.serialize() as E)
    }
  }

  serialize(): E {
    return JSON.parse(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(this.props).map((entry) => {
            let [key, value] = entry
            const valueIsArray = isArray(value)
            if (valueIsArray) value = value.map((item: any) => (item?.serialize ? item.serialize() : item))
            const serializedValue = value?.serialize ? value.serialize() : value
            return [key, serializedValue]
          })
        )
      )
    )
  }

  toString(): string {
    return JSON.stringify(this.serialize())
  }
}
