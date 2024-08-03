import { OrderEnum } from '@hatsuportal/common'

export interface GetCommentsInputDTO {
  postId: string
  limit: number
  cursor?: string
  sort: OrderEnum
}
