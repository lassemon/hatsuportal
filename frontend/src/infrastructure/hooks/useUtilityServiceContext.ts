import { UtilityServiceContext } from 'infrastructure/context/UtilityServiceContext'
import { useContext } from 'react'

export const useUtilityServiceContext = () => {
  const utilityServiceContext = useContext(UtilityServiceContext)

  if (!utilityServiceContext) {
    throw new Error('utilityServiceContext has to be used within <UtilityServiceContext.Provider>')
  }

  return utilityServiceContext
}
