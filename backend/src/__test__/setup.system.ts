import { beforeAll, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import config from '../config'
import { createSystemWiring } from './support/system/SystemWiring'

let systemWiring: Awaited<ReturnType<typeof createSystemWiring>>

beforeAll(async () => {
  await fs.mkdir(path.resolve(`./${config.images.basePath.replace(/^\.\//, '').replace(/\/$/, '')}`), { recursive: true })
  systemWiring = await createSystemWiring()
})

beforeEach(() => {
  systemWiring.clearRepositoryCache()
})

afterEach(() => {
  systemWiring.clearRepositoryCache()
})

export { systemWiring }
