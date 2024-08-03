import { ITransaction } from './ITransaction'

export interface IRepository {
  setTransaction(transaction: ITransaction | null): void
  clearLastLoadedMap(): void
}
