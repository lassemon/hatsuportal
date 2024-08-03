import { ILocalStorageService } from 'application/interfaces'
import { StoryViewModelDTO } from 'ui/entities/story/model/StoryViewModel'
import { AuthStateDTO } from 'ui/app/state/authAtom'
import { Breadcrumb } from 'ui/shared/state/breadcrumbAtom'

export interface IStorageServiceContext {
  localStorageStoryService: ILocalStorageService<StoryViewModelDTO>
  localStorageAuthService: ILocalStorageService<AuthStateDTO>
  localStorageBreadcrumbService: ILocalStorageService<Breadcrumb[]>
}
