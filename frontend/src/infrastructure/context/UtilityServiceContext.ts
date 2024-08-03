import { IUtilityServiceContext } from 'application/interfaces'
import { createContext } from 'react'

export const UtilityServiceContext = createContext<IUtilityServiceContext | null>(null)
