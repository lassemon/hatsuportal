export enum DiscoverOption {
  POSTS = 'posts',
  THEMES = 'themes'
}

export const discoverOptions = [
  { label: 'Posts', value: DiscoverOption.POSTS, path: 'posts', loginRequired: false },
  { label: 'Themes', value: DiscoverOption.THEMES, path: 'themes', loginRequired: true }
] as const

export const defaultDiscoverOption = DiscoverOption.POSTS

export const getDiscoverOptionFromPath = (pathname: string): DiscoverOption => {
  const segment = pathname.replace(/^\//, '').split('/')[0]
  const match = discoverOptions.find((option) => option.path === segment)
  return match?.value ?? defaultDiscoverOption
}

export const getDiscoverPath = (option: DiscoverOption): string => {
  const match = discoverOptions.find((item) => item.value === option)
  return `/${match?.path ?? 'posts'}`
}
