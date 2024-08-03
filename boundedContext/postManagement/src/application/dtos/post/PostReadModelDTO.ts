import { PostBaseDTO } from './PostBaseDTO'

export interface PostReadModelDTO extends PostBaseDTO {
  readonly createdByName: string
}
