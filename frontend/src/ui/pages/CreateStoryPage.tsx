import React, { useEffect, useRef, useState } from 'react'

import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import StoryCard from 'ui/entities/story/ui/StoryCard'
import StoryEdit from 'ui/features/edit-story/ui/StoryEdit'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { useAtom, useSetAtom } from 'jotai'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import PostLayout from 'ui/blocks/PostLayout'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { CreateStoryRequest } from '@hatsuportal/contracts'
import { useRedirectToFrontPageIfNotLoggedIn } from 'ui/shared/hooks/useRedirect'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { useStory } from 'ui/entities/story/hooks/useStory'
import { createStoryDraftAtom } from 'ui/entities/story/model/createStoryDraftAtom'

const CreateStoryPage: React.FC = () => {
  useRedirectToFrontPageIfNotLoggedIn()

  const [savingStory, setSavingStory] = useState(false)
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom)
  const [errorState, setError] = useAtom(errorAtom)
  const setSuccess = useSetAtom(successAtom)

  const entityServiceContext = useEntityServiceContext()
  const controllersRef = useRef<AbortController[]>([])

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const [createDraft, setCreateDraft] = useAtom(createStoryDraftAtom)

  const emptyStory = createDraft ?? StoryViewModel.createEmpty()

  const persistCreateDraft = (story: StoryViewModel | null) => {
    setCreateDraft(story ?? StoryViewModel.createEmpty())
  }

  const onCreate = (_story: CreateStoryRequest) => {
    if (_story) {
      if (errorState) {
        setError(null)
      }
      if (authState.loggedIn && authState.user) {
        const controller = new AbortController()
        controllersRef.current.push(controller)
        setSavingStory(true)
        entityServiceContext.storyService
          .create(_story, { signal: controller.signal })
          .then((savedStory) => {
            setCreateDraft(null)
            setSuccess({ message: 'Story created succesfully!' })
            if (savedStory.id)
              navigate([
                { href: '/stories', label: 'Stories' },
                { href: `/story/${savedStory.id}`, label: `"${savedStory.title}"` }
              ])
          })
          .catch((error) => {
            setError(error)
          })
          .finally(() => {
            setSavingStory(false)
          })
      }
    }
  }

  return (
    <PostLayout
      viewMode={ViewModeEnum.Edit}
      layoutComponent={
        savingStory ? <LoadingSkeleton skeletonProps={{ height: '20em' }} /> : <StoryCard story={emptyStory} loadingStory={false} />
      }
      editComponent={
        authState.loggedIn && (
          <StoryEdit
            story={emptyStory}
            backendStory={null}
            loadingStory={false}
            setStory={persistCreateDraft}
            onCreate={onCreate}
            savingStory={savingStory}
          />
        )
      }
    />
  )
}

export default CreateStoryPage
