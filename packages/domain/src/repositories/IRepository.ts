export interface IRepository<ITransaction = unknown> {
  setTransaction(transaction: ITransaction | null): void
}
