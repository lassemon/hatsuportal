import { containsWhitespace } from '@hatsuportal/common'
import { Visibility } from '../enums/Visibility'

export interface EntityDTO {
  readonly id: string
  visibility: `${Visibility}`
  readonly createdBy: string
  readonly createdByUserName: string
  readonly createdAt: number
  updatedAt: number | null
}

abstract class AbstractEntity<Props extends EntityDTO = EntityDTO> {
  protected props: Props

  abstract get id(): string
  abstract get visibility(): `${Visibility}`
  abstract get createdBy(): string
  abstract get createdByUserName(): string
  abstract get createdAt(): number
  abstract get updatedAt(): number | null
  abstract isEqual(other: this): boolean
  abstract clone(props: Partial<Props>): this
  abstract serialize(): { [key: string]: any }
  abstract toString(): string
  protected abstract getAllowedKeys(): (keyof Props)[]

  constructor(props: Props) {
    if (!props.id) throw new Error('Entity must have an id')
    if (containsWhitespace(props.id)) throw new Error(`Entity id "${props.id}" cannot contain white spaces.`)
    this.props = props
  }
}

export default AbstractEntity
