import { OrderEnum } from '@hatsuportal/common'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'

export interface ICronJobConfig {
  cronPattern: string
  description: string
}

export interface Configs {
  comment: {
    defaultSortOrder: OrderEnum
    defaultRepliesSortOrder: OrderEnum
    defaultRepliesPreviewLimit: NonNegativeInteger
  }
  domainEvents: {
    maxAgeSeconds: number
  }
  images: {
    basePath: string
    orphanMaxAgeMs: number
    versionRetentionCount: number
  }
  cron: {
    processDomainEventsJob: ICronJobConfig
    cleanupOrphanImagesJob: ICronJobConfig
    cleanupDomainEventsJob: ICronJobConfig
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
  },
  domainEvents: {
    maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
  },
  images: {
    basePath: process.env.IMAGES_BASE_PATH || './images',
    orphanMaxAgeMs: 10 * 60 * 1000, // 10 minutes
    versionRetentionCount: 3
  },
  cron: {
    processDomainEventsJob: {
      cronPattern: '*/10 * * * * *',
      description: 'Runs every 10 seconds'
    },
    cleanupOrphanImagesJob: {
      cronPattern: '0 */15 * * * *',
      description: 'Runs every 15 minutes'
    },
    cleanupDomainEventsJob: {
      cronPattern: '0 0 1 * * *',
      description: 'Runs every night at 1:00 AM'
    }
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
