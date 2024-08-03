import { User } from '@hatsuportal/domain'
import { Request } from 'express'

export interface TsoaRequest extends Request {
  user?: User
}
