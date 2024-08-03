import { beforeEach, vi } from 'vitest'
import * as testFactory from './testFactory'
import { promises as fs } from 'node:fs'
import { vol } from 'memfs'

vi.mock('node:fs', async () => {
  // Get the actual fs module
  const actual = await vi.importActual<typeof fs>('fs')

  return {
    ...actual,
    promises: {
      ...vol.promises // Replace promises with memfs promises
    }
  }
})

beforeEach(async (context) => {
  context.unitFixture = testFactory
  vol.reset() // Reset the virtual file system before each test
})
