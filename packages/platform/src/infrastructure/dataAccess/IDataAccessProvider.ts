import { IQueryBuilder } from './IQueryBuilder'
import { IRawQueryBuilder } from './IRawQueryBuilder'

export interface IDataAccessProvider extends IRawQueryBuilder {
  table<TRecord extends {} = any>(tableName: string): IQueryBuilder<TRecord>
  transaction<T>(work: (trx: IDataAccessProvider) => Promise<T>): Promise<T>
}
