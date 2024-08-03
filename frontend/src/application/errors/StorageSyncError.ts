import { ErrorFoundation } from '@hatsuportal/common'

export class StorageSyncError extends ErrorFoundation {
  constructor(message?: string) {
    super(message || 'Storage sync error')
  }
}
