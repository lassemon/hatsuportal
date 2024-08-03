import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { atomWithStorage } from 'jotai/utils'

export type StoryViewModeById = Record<string, ViewModeEnum>

export const storyViewModeAtom = atomWithStorage<StoryViewModeById>('storyViewModeByStoryId', {}, undefined, { getOnInit: true })
