import { describe, expect, it } from 'vitest'
import { StoryFactory } from './StoryFactory'
import { DomainError } from '@hatsuportal/common-bounded-context'
import { BASE64_PREFIX } from '@hatsuportal/common'

describe('StoryFactory', () => {
  const storyFactory = new StoryFactory()

  it('should throw validation error when name is empty', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      name: ''
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when name is whitespace only', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      name: '   '
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when description is empty', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      description: ''
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when description is whitespace only', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      description: '   '
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when visibility is invalid', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      visibility: 'Invalid' as any
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when id is empty', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      id: ''
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when id is invalid format', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      id: 'invalid-id-format'
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when createdById is empty', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdById: ''
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when createdById is invalid format', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdById: 'invalid-user-id-format'
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when createdByName is empty', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdByName: ''
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when createdByName is whitespace only', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdByName: '   '
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when createdAt is invalid timestamp', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdAt: -1
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when updatedAt is invalid timestamp', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      updatedAt: -1
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when updatedAt is before createdAt', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      createdAt: 1000,
      updatedAt: 500
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when image mimeType is invalid', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      image: {
        ...storyDTOMock.image,
        mimeType: 'invalid-mime-type'
      }
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when image size is invalid', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      image: {
        ...storyDTOMock.image,
        size: -100
      }
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })

  it('should throw validation error when image base64 string is invalid', async ({ unitFixture }) => {
    // Arrange
    const storyDTOMock = unitFixture.storyDTOMock()
    const storyProps = {
      ...storyDTOMock,
      image: {
        ...storyDTOMock.image,
        base64: BASE64_PREFIX
      }
    }

    // Act
    const result = storyFactory.createStory(storyProps)

    // Assert
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })
})
