import type { RepositoryCaches } from '../../../compositionRoot'

export function clearRepositoryCaches(caches: RepositoryCaches): void {
  caches.userWrite.invalidateByPrefix('findById:')
  caches.userWrite.invalidateByPrefix('findByName:')
  caches.userRead.invalidateByPrefix('findById:')

  caches.image.invalidateByPrefix('findById:')
  caches.image.invalidateByPrefix('findByIdAndVersionId:')

  caches.tag.invalidateByPrefix('findById:')
  caches.tag.delete('findAll')

  caches.storyRead.invalidateByPrefix('findById:')

  caches.commentRead.invalidateByPrefix('getById:')

  caches.mediaGateway.invalidateByPrefix('getImageById:')
}
