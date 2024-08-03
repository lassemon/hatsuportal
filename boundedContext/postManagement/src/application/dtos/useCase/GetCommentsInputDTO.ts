import { OrderEnum } from '@hatsuportal/foundation'

export interface GetCommentsInputDTO {
  postId: string
  limit: number
  cursor?: string
  sort: OrderEnum
}
