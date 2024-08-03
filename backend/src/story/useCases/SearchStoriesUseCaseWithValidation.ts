import { ISearchStoriesUseCase, ISearchStoriesUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { isBoolean, isString, StorySortableKeyEnum, Logger, OrderEnum /*VisibilityEnum*/ } from '@hatsuportal/common'
import _ from 'lodash'
//import { User } from '@hatsuportal/domain'

const logger = new Logger('SearchStoriesUseCaseWithValidation')

export class SearchStoriesUseCaseWithValidation
  extends UseCaseWithValidation<ISearchStoriesUseCaseOptions>
  implements ISearchStoriesUseCase
{
  constructor(private readonly useCase: ISearchStoriesUseCase) {
    super(logger)
  }

  async execute(options: ISearchStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating SearchStoriesUseCase arguments')
    const {
      searchStoriesInput: { searchCriteria }
    } = options

    // TODO, validate that if the user is NOT logged in, visibility cannot be given as a filter
    //if (!loggedInUser && searchCriteria.visibility) {
    //  throw (this.constructor.name, 'visibility') // TODO, remove this and throw an error in use case with validation
    //}

    const valid =
      //this.testArgumentInstance(User, 'user', options) && // TODO, this can only be checked when the user is logged in
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.storiesPerPage', options) &&
      this.testArgumentInstance(Number, 'searchStoriesInput.searchCriteria.pageNumber', options) &&
      ((searchCriteria.onlyMyStories ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.onlyMyStories', options, isBoolean)
        : true) &&
      ((searchCriteria.order ?? null) !== null
        ? this.testEnumArgument(OrderEnum, 'searchStoriesInput.searchCriteria.order', options)
        : true) &&
      ((searchCriteria.orderBy ?? null) !== null
        ? this.testEnumArgument(StorySortableKeyEnum, 'searchStoriesInput.searchCriteria.orderBy', options)
        : true) &&
      ((searchCriteria.search ?? null) !== null
        ? this.testArgumentInstance(String, 'searchStoriesInput.searchCriteria.search', options, isString)
        : true) &&
      /*(!_.isEmpty(searchCriteria.visibility) // TODO, how to validate an array of enums
        ? this.testEnumArgument(VisibilityEnum, 'searchStoriesInput.searchCriteria.visibility', options)
        : true) &&*/
      ((searchCriteria.hasImage ?? null) !== null
        ? this.testArgumentInstance(Boolean, 'searchStoriesInput.searchCriteria.hasImage', options, isBoolean)
        : true)

    if (valid) await this.useCase.execute(options)
  }
}
