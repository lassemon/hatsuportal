import { SearchItemsQueryDTO } from './SearchItemsQueryDTO'

export interface CountItemsQueryDTO extends Omit<SearchItemsQueryDTO, 'order' | 'orderBy'> {}
