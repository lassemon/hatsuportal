export const constructUrl = (paths: Array<string | undefined>) => {
  return `/${paths.filter((part) => !!part).join("/")}`
}
