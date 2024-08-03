import { beforeEach } from 'vitest'
import * as testFactory from './testFactory'

beforeEach(async (context) => {
  context.unitFixture = testFactory
})
