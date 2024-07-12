export interface PasswordEncryptionServiceInterface {
  encrypt(clearText: string): Promise<string>
  compare(clearText: string, hash: string): Promise<boolean>
}
