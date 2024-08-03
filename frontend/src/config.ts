export interface Configs {
  localStorageInvalidateTimeInMilliseconds: number
  textColumnMaxWidth: string
}

const defaultConfigs: Configs = {
  localStorageInvalidateTimeInMilliseconds: 15000,
  textColumnMaxWidth: '120ch'
}

export default defaultConfigs
