import { SearchItemsRequestDTO, ISearchItemsUseCase, ISearchItemsUseCaseOptions } from '@hatsuportal/application'
import _ from 'lodash'
import { Item, IItemRepository, ItemSortableKey, Order, UnknownError } from '@hatsuportal/domain'
import { CountItemsQueryDTO, InsertItemQueryDTO, SearchItemsQueryDTO, UpdateItemQueryDTO } from '@hatsuportal/application'

export class SearchItemsUseCase implements ISearchItemsUseCase {
  constructor(
    private readonly itemRepository: IItemRepository<CountItemsQueryDTO, SearchItemsQueryDTO, InsertItemQueryDTO, UpdateItemQueryDTO>
  ) {}

  async execute(options: ISearchItemsUseCaseOptions) {
    const { user, ...itemSearchRequest } = options
    try {
      const isAnyFilterDefined = this.anyFilterDefined(itemSearchRequest)

      let itemList = []
      let totalCount = itemList.length

      if (isAnyFilterDefined) {
        if (!user && options.visibility) {
          throw (this.constructor.name, 'visibility')
        }
        const { items, itemCount } = await this.searchItemsWithFilters(options)
        itemList = items
        totalCount = itemCount
      } else if (user) {
        const { items, itemCount } = await this.getAllItemsForLoggedInUser(user.id, options.orderBy, options.order)
        itemList = items
        totalCount = itemCount
      } else {
        const { items, itemCount } = await this.getAllPublicItems(options.orderBy, options.order)
        itemList = items
        totalCount = itemCount
      }

      const sortedItems = this.sortItems(itemList, itemSearchRequest.orderBy, itemSearchRequest.order)
      const paginatedItems = this.paginateItems(sortedItems, options.itemsPerPage, options.pageNumber)

      return {
        items: paginatedItems.map((item) => item.serialize()),
        totalCount
      }
    } catch (error: any) {
      throw new UnknownError(500, 'InternalServerError', error?.stack ? error.stack : error)
    }
  }

  private paginateItems = (items: Item[], itemsPerPage: number | undefined, pageNumber: number = 0) => {
    const startIndex = itemsPerPage ? (pageNumber || 1 - 1) * (itemsPerPage || items.length) : 0
    const endIndex = itemsPerPage ? startIndex + (itemsPerPage || items.length) : items.length

    return items.slice(startIndex, endIndex)
  }

  private searchItemsWithFilters = async (queryParams: ISearchItemsUseCaseOptions) => {
    const itemCount = await this.itemRepository.count(this.constructCountItemsQueryParams(queryParams))
    const items = await this.itemRepository.search(this.constructSearchItemsQueryParams(queryParams))
    return {
      items,
      itemCount
    }
  }

  private getAllItemsForLoggedInUser = async (userId: string, orderBy: string = 'name', order: `${Order}` = Order.Ascending) => {
    const items = await this.itemRepository.findAllVisibleForLoggedInUser(userId, orderBy, order)
    const itemCount = items.length
    return {
      items,
      itemCount
    }
  }

  private getAllPublicItems = async (orderBy: string = 'name', order: `${Order}` = Order.Ascending) => {
    const items = await this.itemRepository.findAllPublic(orderBy, order)
    const itemCount = items.length
    return {
      items,
      itemCount
    }
  }

  private anyFilterDefined(filters: SearchItemsRequestDTO): boolean {
    if (!filters) {
      return false
    }
    const anyNonMandatoryFilterExists =
      _.without(Object.keys(filters), 'itemsPerPage', 'pageNumber', 'onlyMyItems', 'order', 'orderBy').length > 0
    return anyNonMandatoryFilterExists || filters.onlyMyItems === true
  }

  private constructCountItemsQueryParams = ({
    user,
    onlyMyItems = false,
    search,
    visibility,
    hasImage
  }: Omit<ISearchItemsUseCaseOptions, 'order' | 'orderBy'>) => {
    return {
      userId: user?.id,
      onlyMyItems,
      search,
      visibility,
      hasImage
    }
  }

  private constructSearchItemsQueryParams = ({
    user,
    onlyMyItems = false,
    order = Order.Ascending,
    orderBy = ItemSortableKey.NAME,
    search,
    visibility,
    hasImage
  }: ISearchItemsUseCaseOptions) => {
    return {
      onlyMyItems,
      order,
      orderBy,
      userId: user?.id,
      search,
      visibility,
      hasImage
    }
  }

  private sortItems = (_items: Item[], orderBy: string = 'name', order: `${Order}` = Order.Ascending) => {
    return _.orderBy(_items, [orderBy], order)
  }
}
