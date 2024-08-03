import { DataServiceContext } from 'infrastructure/context/DataServiceContext'
import { useContext } from 'react'

export const useDataServiceContext = () => {
  const serviceContext = useContext(DataServiceContext)

  if (!serviceContext) {
    throw new Error('dataServiceContext has to be used within <DataServiceContext.Provider>')
  }

  return serviceContext
}
