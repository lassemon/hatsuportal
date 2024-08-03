import { User } from '@hatsuportal/user-management'
import { Request } from 'express'
/**
 * NOTE: DO NOT USE PartialExceptFor or other type utils here, it will break the validation of the request
 * (TSOA route.js generation models.X.properties variable is not properly generated)
 */
export interface TsoaRequest extends Request {
  user?: User
}
