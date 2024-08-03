import { ILocalStorageService } from 'application/interfaces'
import { StoryViewModelDTO } from 'ui/features/post/story/viewModels/StoryViewModel'
import { AuthStateDTO } from 'ui/state/authAtom'
import { Breadcrumb } from 'ui/state/breadcrumbAtom'

export interface IStorageServiceContext {
  localStorageStoryService: ILocalStorageService<StoryViewModelDTO>
  localStorageAuthService: ILocalStorageService<AuthStateDTO>
  localStorageBreadcrumbService: ILocalStorageService<Breadcrumb[]>
}
