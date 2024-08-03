import { IAuthServiceContext } from 'application/context/IAuthServiceContext'
import { createContext } from 'react'

export const AuthServiceContext = createContext<IAuthServiceContext | null>(null)
