import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StoryUnitOfWork } from './StoryUnitOfWork'
import { DataPersistenceError, IDomainEventDispatcher, ITransaction } from '@hatsuportal/application'
import { StoryCreatedEvent, ImageAddedToStoryEvent, IStoryRepository, IImageRepository } from '@hatsuportal/domain'
import { IKnexConnection } from './database/connection'

describe('StoryUnitOfWork', () => {
  let unitOfWork: StoryUnitOfWork
  let connectionMock: IKnexConnection
  let storyRepo: IStoryRepository
  let imageRepo: IImageRepository
  let eventDispatcher: IDomainEventDispatcher
  let transactionMock: ITransaction

  beforeEach(({ unitFixture }) => {
    transactionMock = {
      begin: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn()
    }

    connectionMock = {
      getTransaction: vi.fn().mockResolvedValue(transactionMock),
      getConnection: vi.fn()
    }

    storyRepo = unitFixture.storyRepositoryMock()
    imageRepo = unitFixture.imageRepositoryMock()
    eventDispatcher = unitFixture.domainEventDispatcherMock()

    unitOfWork = new StoryUnitOfWork(connectionMock, storyRepo, imageRepo, eventDispatcher)
  })

  describe('aggregate', () => {
    it('should throw error when accessing aggregate before initialization', () => {
      expect(() => unitOfWork.aggregate).toThrow(DataPersistenceError)
    })

    it('should allow setting and getting aggregate', ({ unitFixture }) => {
      const story = unitFixture.storyMock()
      unitOfWork.aggregate = story
      expect(unitOfWork.aggregate).toBe(story)
    })
  })

  describe('beginTransaction', () => {
    it('should throw error if aggregate is not set', async () => {
      await expect(unitOfWork.beginTransaction()).rejects.toThrow(DataPersistenceError)
    })

    it('should start transaction and set it on repositories', async ({ unitFixture }) => {
      // Arrange
      unitOfWork.aggregate = unitFixture.storyMock()

      // Act
      await unitOfWork.beginTransaction()

      // Assert
      expect(connectionMock.getTransaction).toHaveBeenCalled()
      expect(storyRepo.setTransaction).toHaveBeenCalledWith(transactionMock)
      expect(imageRepo.setTransaction).toHaveBeenCalledWith(transactionMock)
    })
  })

  describe('commit', () => {
    it('should throw error if aggregate is not set', async () => {
      await expect(unitOfWork.commit()).rejects.toThrow(DataPersistenceError)
    })

    it('should throw error if transaction is not started', async ({ unitFixture }) => {
      // Arrange
      unitOfWork.aggregate = unitFixture.storyMock()

      // Act & Assert
      await expect(unitOfWork.commit()).rejects.toThrow(DataPersistenceError)
    })

    it('should dispatch domain events, commit transaction and clear events', async ({ unitFixture }) => {
      // Arrange
      const story = unitFixture.storyMock()
      const event = new StoryCreatedEvent(story)
      story.addDomainEvent(event)

      unitOfWork.aggregate = story
      await unitOfWork.beginTransaction()

      // Act
      await unitOfWork.commit()

      // Assert
      expect(eventDispatcher.dispatch).toHaveBeenCalledWith(event)
      expect(transactionMock.commit).toHaveBeenCalled()
      expect(story.domainEvents).toHaveLength(0)
    })

    it('should rollback and throw if event dispatch fails', async ({ unitFixture }) => {
      // Arrange
      const story = unitFixture.storyMock()
      story.addDomainEvent(new StoryCreatedEvent(story))
      unitOfWork.aggregate = story
      await unitOfWork.beginTransaction()

      const error = new Error('Event dispatch failed')
      eventDispatcher.dispatch = vi.fn().mockRejectedValue(error)

      // Act & Assert
      await expect(unitOfWork.commit()).rejects.toThrow(error)
      expect(transactionMock.rollback).toHaveBeenCalled()
    })

    it('should clear transactions after commit', async ({ unitFixture }) => {
      // Arrange
      unitOfWork.aggregate = unitFixture.storyMock()
      await unitOfWork.beginTransaction()

      // Act
      await unitOfWork.commit()

      // Assert
      expect(storyRepo.setTransaction).toHaveBeenLastCalledWith(null)
      expect(imageRepo.setTransaction).toHaveBeenLastCalledWith(null)
    })
  })

  describe('rollback', () => {
    it('should throw error if transaction is not started', async () => {
      await expect(unitOfWork.rollback()).rejects.toThrow(DataPersistenceError)
    })

    it('should rollback transaction and clear transactions', async ({ unitFixture }) => {
      // Arrange
      unitOfWork.aggregate = unitFixture.storyMock()
      await unitOfWork.beginTransaction()

      // Act
      await unitOfWork.rollback()

      // Assert
      expect(transactionMock.rollback).toHaveBeenCalled()
      expect(storyRepo.setTransaction).toHaveBeenLastCalledWith(null)
      expect(imageRepo.setTransaction).toHaveBeenLastCalledWith(null)
    })
  })

  describe('execute', () => {
    it('should begin transaction and commit', async ({ unitFixture }) => {
      // Arrange
      const story = unitFixture.storyMock()
      unitOfWork.aggregate = story

      const beginTransactionSpy = vi.spyOn(unitOfWork, 'beginTransaction')
      const commitSpy = vi.spyOn(unitOfWork, 'commit')

      // Act
      await unitOfWork.execute()

      // Assert
      expect(beginTransactionSpy).toHaveBeenCalled()
      expect(commitSpy).toHaveBeenCalled()
    })

    it('should throw error if aggregate is not set', async () => {
      await expect(unitOfWork.execute()).rejects.toThrow(DataPersistenceError)
    })
  })

  describe('multiple events', () => {
    it('should dispatch multiple events in order', async ({ unitFixture }) => {
      // Arrange
      const story = unitFixture.storyMock()
      const storyCreatedEvent = new StoryCreatedEvent(story)
      const imageAddedEvent = new ImageAddedToStoryEvent(story, story.image!)

      story.addDomainEvent(storyCreatedEvent)
      story.addDomainEvent(imageAddedEvent)

      unitOfWork.aggregate = story
      await unitOfWork.beginTransaction()

      // Act
      await unitOfWork.commit()

      // Assert
      expect(eventDispatcher.dispatch).toHaveBeenCalledTimes(2)
      expect(eventDispatcher.dispatch).toHaveBeenNthCalledWith(1, storyCreatedEvent)
      expect(eventDispatcher.dispatch).toHaveBeenNthCalledWith(2, imageAddedEvent)
    })
  })
})
