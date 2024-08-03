import { IUtilityServiceContext } from 'application'
import { createContext } from 'react'

export const UtilityServiceContext = createContext<IUtilityServiceContext | null>(null)
