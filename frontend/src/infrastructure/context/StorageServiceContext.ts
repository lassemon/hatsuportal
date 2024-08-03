import { IStorageServiceContext } from 'application/interfaces/context/IStorageServiceContext'
import { createContext } from 'react'

export const StorageServiceContext = createContext<IStorageServiceContext | null>(null)
