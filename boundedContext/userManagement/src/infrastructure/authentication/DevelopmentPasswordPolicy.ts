import { isNonStringOrEmpty } from '@hatsuportal/common'
import { IPasswordPolicy } from '../../domain/policies/IPasswordPolicy'

export class DevelopmentPasswordPolicy implements IPasswordPolicy {
  isValid(value: string): boolean {
    if (isNonStringOrEmpty(value)) {
      return false
    }
    return true
  }

  getRulesMessage(): string {
    return 'Development password policy'
  }
}
