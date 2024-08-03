import { AuthServiceContext } from 'infrastructure/context/AuthServiceContext'
import { useContext } from 'react'

export const useAuthServiceContext = () => {
  const authServiceContext = useContext(AuthServiceContext)

  if (!authServiceContext) {
    throw new Error('authServiceContext has to be used within <AuthServiceContext.Provider>')
  }

  return authServiceContext
}
