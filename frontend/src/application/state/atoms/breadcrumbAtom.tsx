import { atomWithAsyncStorage } from './atomWithAsyncStorage'

export interface Breadcrumb {
  label: string
  href: string
}

export const breadcrumbAtom = atomWithAsyncStorage<Breadcrumb[]>('breadcrumbAtom', [], { loadParser: (value) => value })
