import { describe, expect, it } from 'vitest'
import Image from './Image'
import _ from 'lodash'
import { VisibilityEnum } from '@hatsuportal/common'

describe('Image', () => {
  it('can create image with all properties', ({ unitFixture }) => {
    const image = new Image(unitFixture.imageDTO())
    expect(image.base64.value).toBe(unitFixture.imageDTO().base64)
  })

  it('creates image with proper base64 encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.imageDTO(), base64: 'testbinarystring' })
    expect(image.base64.value).toBe('data:image/png;base64,testbinarystring')
  })

  it('sets image base64 with proper encoding prefix', ({ unitFixture }) => {
    const image = new Image({ ...unitFixture.imageDTO() })
    image.base64 = 'testbinarystring'
    expect(image.base64.value).toBe('data:image/png;base64,testbinarystring')
  })
})
