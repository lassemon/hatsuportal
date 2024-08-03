import { IEntityServiceContext } from 'application/interfaces'
import { createContext } from 'react'

export const EntityServiceContext = createContext<IEntityServiceContext | null>(null)
