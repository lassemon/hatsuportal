import { IDataServiceContext } from 'application'
import { createContext } from 'react'

export const DataServiceContext = createContext<IDataServiceContext | null>(null)
