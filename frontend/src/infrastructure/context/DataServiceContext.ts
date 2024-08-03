import { IDataServiceContext } from 'application/interfaces'
import { createContext } from 'react'

export const DataServiceContext = createContext<IDataServiceContext | null>(null)
