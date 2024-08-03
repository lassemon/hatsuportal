import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export interface Configs {
  comment: {
    defaultSortOrder: OrderEnum
    defaultRepliesSortOrder: OrderEnum
    defaultRepliesPreviewLimit: NonNegativeInteger
  }
}

export enum Env {
  Dev = 'dev',
  Test = 'test',
  CI = 'ci',
  Staging = 'staging', // test environment
  Prod = 'prod'
}

const defaultConfigs: Configs = {
  comment: {
    defaultSortOrder: OrderEnum.Descending,
    defaultRepliesSortOrder: OrderEnum.Ascending,
    defaultRepliesPreviewLimit: new NonNegativeInteger(4)
  }
}

export const allConfigs: Record<Env, Configs> = {
  [Env.Dev]: {
    ...defaultConfigs
  },
  [Env.Test]: {
    ...defaultConfigs
  },
  [Env.CI]: {
    ...defaultConfigs
  },
  [Env.Staging]: {
    ...defaultConfigs
  },
  [Env.Prod]: {
    ...defaultConfigs
  }
}

export default allConfigs[(process.env.NODE_ENV as Env) || 'dev']

export const getConfigByEnv = (env: Env) => {
  return allConfigs[env || 'dev']
}
