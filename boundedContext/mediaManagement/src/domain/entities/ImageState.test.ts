import { describe, it, expect } from 'vitest'
import { ImageState } from './ImageState'
import { ImageStateEnum } from '@hatsuportal/foundation'

describe('ImageState', () => {
  it('should construct with a valid ImageStateEnum value', () => {
    const state = new ImageState(ImageStateEnum.Available)
    expect(state.value).toBe(ImageStateEnum.Available)
    expect(state.toString()).toBe(ImageStateEnum.Available)
  })

  it('should throw if constructed with an invalid value', () => {
    // @ts-expect-error
    expect(() => new ImageState('not-a-valid-state')).toThrow()
    // @ts-expect-error
    expect(() => new ImageState(undefined)).toThrow()
    // @ts-expect-error
    expect(() => new ImageState(null)).toThrow()
  })

  it('isAvailable returns true only for Available', () => {
    expect(new ImageState(ImageStateEnum.Available).isAvailable()).toBe(true)
    expect(new ImageState(ImageStateEnum.FailedToLoad).isAvailable()).toBe(false)
    expect(new ImageState(ImageStateEnum.NotSet).isAvailable()).toBe(false)
  })

  it('isFailedToLoad returns true only for FailedToLoad', () => {
    expect(new ImageState(ImageStateEnum.FailedToLoad).isFailedToLoad()).toBe(true)
    expect(new ImageState(ImageStateEnum.Available).isFailedToLoad()).toBe(false)
    expect(new ImageState(ImageStateEnum.NotSet).isFailedToLoad()).toBe(false)
  })

  it('isNotSet returns true only for NotSet', () => {
    expect(new ImageState(ImageStateEnum.NotSet).isNotSet()).toBe(true)
    expect(new ImageState(ImageStateEnum.Available).isNotSet()).toBe(false)
    expect(new ImageState(ImageStateEnum.FailedToLoad).isNotSet()).toBe(false)
  })

  it('equals returns true for same value, false for different', () => {
    const a = new ImageState(ImageStateEnum.Available)
    const b = new ImageState(ImageStateEnum.Available)
    const c = new ImageState(ImageStateEnum.FailedToLoad)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('toString returns the enum value', () => {
    const state = new ImageState(ImageStateEnum.FailedToLoad)
    expect(state.toString()).toBe(ImageStateEnum.FailedToLoad)
  })
})
