import { describe, expect, it } from 'vitest'
import { ItemMapper } from './ItemMapper'
import { Item, User } from '@hatsuportal/domain'

describe('ItemMapper', () => {
  const itemMapper = new ItemMapper()
  it('converts create request to item', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    const createRequest = unitFixture.createItemRequest()
    const item = itemMapper.createRequestToItem(createRequest, user)
    expect(item).toBeInstanceOf(Item)

    // common entity properties
    expect(item.id).toBeTypeOf('string')
    expect(item.id).not.toBe((createRequest as any).id) // should not be given from request
    expect(item.visibility).toBe(createRequest.item.visibility)
    expect(item.createdBy).toBe(user.id)
    expect(item.createdBy).not.toBe((createRequest as any).createdBy) // should not be given from request
    expect(item.createdByUserName).toBe(user.name)
    expect(item.createdByUserName).not.toBe((createRequest as any).createdByUserName) // should not be given from request
    expect(item.createdAt).not.toBe((createRequest as any).createdAt) // should not be given from request
    expect(item.createdAt).toBeTypeOf('number')
    expect(item.updatedAt).toBeNull()

    // item properties
    expect(item.imageId).toBeNull() // should always be null because image id is linked to the item only after the storing of image succeeds
    expect(item.name).toBe('Test Item')
    expect(item.description).toBe(createRequest.item.description)
  })

  it('converts update request to item', ({ unitFixture }) => {
    const existingItem = unitFixture.item()
    const updateRequest = unitFixture.updateItemRequest()
    const item = itemMapper.updateRequestToItem(existingItem, updateRequest)
    expect(item).toBeInstanceOf(Item)

    // common entity properties
    expect(item.id).toBe(existingItem.id)
    expect(item.visibility).toBe(updateRequest.item.visibility)
    expect(item.createdBy).toBe(existingItem.createdBy)
    expect(item.createdBy).not.toBe((updateRequest as any).item.createdBy) // should not be able to update from request
    expect(item.createdByUserName).toBe(existingItem.createdByUserName)
    expect(item.createdByUserName).not.toBe((updateRequest as any).item.createdByUserName) // should not be able to update from request
    expect(item.createdAt).toBe(existingItem.createdAt)
    expect(item.createdAt).not.toBe((updateRequest as any).item.createdAt) // should not be able to update from request
    expect(item.updatedAt).toBe(existingItem.updatedAt)
    expect(item.updatedAt).not.toBe((updateRequest as any).item.updatedAt) // should not be able to update from request

    // item properties
    expect(item.imageId).toBeNull() // should always be null at this point. Image id is linked to item only when image storing succeeds
    expect(item.name).toBe(updateRequest.item.name)
    expect(item.description).toBe(updateRequest.item.description)
  })

  it('converts item to insert query', ({ unitFixture }) => {
    const item = unitFixture.item()
    const insertQuery = itemMapper.toInsertQuery({ ...item, imageId: unitFixture.image().id })

    // common entity properties
    expect(insertQuery.id).toBe(item.id)
    expect(insertQuery.visibility).toBe(item.visibility)
    expect(insertQuery.createdBy).toBe(item.createdBy)
    expect(insertQuery.createdByUserName).toBe(item.createdByUserName)
    expect(insertQuery.createdAt).toBe(item.createdAt)
    expect(insertQuery.updatedAt).toBeNull()

    // item properties
    expect(insertQuery.imageId).toBe(unitFixture.image().id)
    expect(insertQuery.name).toBe(item.name)
    expect(insertQuery.description).toBe(item.description)
  })

  it('converts item to update query', ({ unitFixture }) => {
    const item = unitFixture.item()
    const updateQuery = itemMapper.toUpdateQuery(item)
    // common entity properties
    expect(updateQuery.id).toBe(item.id)
    expect(updateQuery.visibility).toBe(item.visibility)
    expect((updateQuery as any).createdBy).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByUserName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(item.updatedAt) // mapper should set new updated at timestamp
    expect(updateQuery.updatedAt).not.toBeNull()

    // item properties
    expect(updateQuery.imageId).toBe(item.imageId)
    expect(updateQuery.name).toBe(item.name)
    expect(updateQuery.description).toBe(item.description)
  })

  it('converts item data to item class instance', ({ unitFixture }) => {
    const item = itemMapper.toItem(unitFixture.item())
    expect(item).toBeInstanceOf(Item)
  })

  it('converts item JSON to item response', ({ unitFixture }) => {
    expect(itemMapper.toResponse(unitFixture.item())).toStrictEqual(unitFixture.item())
  })
})
