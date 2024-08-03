import { Knex } from 'knex'
import { IQueryBuilder } from '@hatsuportal/platform'

/**
 * Knex implementation of IQueryBuilder.
 * Wraps Knex.QueryBuilder and delegates all operations to it.
 */
export class KnexQueryBuilder<TRecord extends {} = any> implements IQueryBuilder<TRecord> {
  constructor(private readonly knexQuery: Knex.QueryBuilder<TRecord, TRecord[]>) {}

  select(columns: string[]): IQueryBuilder<TRecord>
  select(...columns: string[]): IQueryBuilder<TRecord>
  select(...args: any[]): IQueryBuilder<TRecord> {
    if (Array.isArray(args[0])) {
      return new KnexQueryBuilder(this.knexQuery.select(args[0]))
    }
    return new KnexQueryBuilder(this.knexQuery.select(...args))
  }

  distinct(): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.distinct())
  }

  where(field: string, value: any): IQueryBuilder<TRecord>
  where(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  where(record: Record<string, any>): IQueryBuilder<TRecord>
  where(...args: any[]): IQueryBuilder<TRecord> {
    if (args.length === 1 && typeof args[0] === 'object') {
      return new KnexQueryBuilder(this.knexQuery.where(args[0]))
    }
    return new KnexQueryBuilder(this.knexQuery.where(...(args as [string, any, any])))
  }

  andWhere(field: string, value: any): IQueryBuilder<TRecord>
  andWhere(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  andWhere(callback: (queryBuilder: IQueryBuilder<TRecord>) => void): IQueryBuilder<TRecord>
  andWhere(...args: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.andWhere(...(args as [string, any, any])))
  }

  orWhere(field: string, value: any): IQueryBuilder<TRecord>
  orWhere(field: string, operator: string, value: any): IQueryBuilder<TRecord>
  orWhere(callback: (queryBuilder: IQueryBuilder<TRecord>) => void): IQueryBuilder<TRecord>
  orWhere(...args: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.orWhere(...(args as [string, any, any])))
  }

  orWhereNot(record: Record<string, any>): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.orWhereNot(record))
  }

  whereIn(field: string, values: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereIn(field, values))
  }

  whereNotIn(field: string, values: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereNotIn(field, values))
  }

  whereNull(field: string): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereNull(field))
  }

  whereNotNull(field: string): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereNotNull(field))
  }

  whereNot(field: string, value: any): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereNot(field, value))
  }

  whereLike(field: string, value: string): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereLike(field, value))
  }

  whereILike(field: string, value: string): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.whereILike(field, value))
  }

  orWhereILike(field: string, value: string): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.orWhereILike(field, value))
  }

  andWhereRaw(sql: string, bindings?: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.andWhereRaw(sql, bindings))
  }

  leftJoin(table: string, first: string, operator: string, second: string): IQueryBuilder<TRecord>
  leftJoin(table: string, callback: (join: any) => void): IQueryBuilder<TRecord>
  leftJoin(...args: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.leftJoin(...(args as [string, string, string, string])))
  }

  innerJoin(table: string, first: string, operator: string, second: string): IQueryBuilder<TRecord>
  innerJoin(table: string, callback: (join: any) => void): IQueryBuilder<TRecord>
  innerJoin(...args: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.innerJoin(...(args as [string, string, string, string])))
  }

  joinRaw(sql: string, bindings?: any[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.joinRaw(sql, bindings))
  }

  orderBy(column: string, direction?: 'asc' | 'desc'): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.orderBy(column, direction))
  }

  limit(count: number): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.limit(count))
  }

  offset(count: number): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.offset(count))
  }

  count(column?: string): IQueryBuilder<{ count: number }>
  count(column: string, options: { as: string }): IQueryBuilder<any>
  count(...args: any[]): IQueryBuilder<any> {
    if (args.length === 0) {
      return new KnexQueryBuilder(this.knexQuery.count('* as count'))
    }
    if (args.length === 1 && typeof args[0] === 'string') {
      return new KnexQueryBuilder(this.knexQuery.count(args[0]))
    }
    return new KnexQueryBuilder(this.knexQuery.count(args[0], args[1]))
  }

  insert(data: Partial<TRecord> | Partial<TRecord>[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.insert(data as any).returning('*') as any)
  }

  update(data: Partial<TRecord>): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.update(data as any).returning('*') as any)
  }

  delete(): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.delete().returning('*') as any)
  }

  returning(column: string | string[]): IQueryBuilder<TRecord> {
    return new KnexQueryBuilder(this.knexQuery.returning(column))
  }

  onConflict(column: string | string[]): IQueryBuilder<TRecord> & {
    ignore(): IQueryBuilder<TRecord>
    merge(): IQueryBuilder<TRecord>
  } {
    const onConflict = this.knexQuery.onConflict(column as any)
    return {
      ...new KnexQueryBuilder(onConflict as any),
      ignore() {
        return new KnexQueryBuilder((onConflict as any).ignore())
      },
      merge() {
        return new KnexQueryBuilder((onConflict as any).merge())
      }
    } as any
  }

  modify<T = TRecord>(callback: (queryBuilder: IQueryBuilder<T>) => void): IQueryBuilder<T> {
    return new KnexQueryBuilder(
      this.knexQuery.modify((qb: any) => {
        callback(new KnexQueryBuilder(qb) as any)
      })
    ) as any
  }

  first(): Promise<TRecord | null> {
    return this.knexQuery.first()
  }

  then<TResult1 = TRecord[], TResult2 = never>(
    onfulfilled?: ((value: TRecord[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.knexQuery.then(onfulfilled as any, onrejected)
  }
}
