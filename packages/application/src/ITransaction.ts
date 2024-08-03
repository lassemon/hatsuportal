export interface ITransaction {
  begin(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}
