export interface IPasswordPolicy {
  isValid(passwordValue: string): boolean
  getRulesMessage(): string
}
