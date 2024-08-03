import { EntityServiceContext } from 'infrastructure/context/EntityServiceContext'
import { useContext } from 'react'

export const useEntityServiceContext = () => {
  const serviceContext = useContext(EntityServiceContext)

  if (!serviceContext) {
    throw new Error('entityServiceContext has to be used within <EntityServiceContext.Provider>')
  }

  return serviceContext
}
