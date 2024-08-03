const hideSideBarPaths = ['/story/create', '/account', '/profile'] as const

const hideSideBarPrefixes = ['/theme/'] as const

export const shouldHideSideBar = (pathname: string): boolean =>
  hideSideBarPaths.some((path) => pathname === path) || hideSideBarPrefixes.some((prefix) => pathname.startsWith(prefix))
