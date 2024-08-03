import { ITransaction } from './ITransaction'

export interface ITransactionAware {
  setTransaction(transaction: ITransaction | null): void
  clearLastLoadedMap(): void
  getTableName(): string
}
