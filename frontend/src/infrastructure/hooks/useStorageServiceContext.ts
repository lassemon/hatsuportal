import { StorageServiceContext } from 'infrastructure/context/StorageServiceContext'
import { useContext } from 'react'

export const useStorageServiceContext = () => {
  const storageServiceContext = useContext(StorageServiceContext)

  if (!storageServiceContext) {
    throw new Error('storageServiceContext has to be used within <StorageServiceContext.Provider>')
  }

  return storageServiceContext
}
