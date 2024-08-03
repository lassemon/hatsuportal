export type { ITransaction } from './dataAccess/ITransaction'
export type { ITransactionManager } from './dataAccess/ITransactionManager'
export type { IDatabaseConnectionProvider } from './dataAccess/IDatabaseConnectionProvider'
export type { ITransactionAware } from './dataAccess/ITransactionAware'

export { default as ConcurrencyError } from './errors/ConcurrencyError'
export { default as DataPersistenceError } from './errors/DataPersistenceError'
