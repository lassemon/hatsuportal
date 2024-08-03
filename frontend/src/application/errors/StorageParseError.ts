import { ErrorFoundation } from '@hatsuportal/common'

export class StorageParseError extends ErrorFoundation {
  constructor(message?: string) {
    super(message || 'Storage parse error')
  }
}
