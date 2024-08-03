import { IAuthServiceContext } from 'application/interfaces'
import { createContext } from 'react'

export const AuthServiceContext = createContext<IAuthServiceContext | null>(null)
