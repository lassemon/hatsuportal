import React, { useEffect, useRef, useState } from 'react'

import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import StoryCard from 'ui/features/post/story/components/StoryCard'
import StoryEdit from 'ui/features/post/story/components/StoryEdit'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { successAtom } from 'ui/state/successAtom'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import PostLayout from 'ui/shared/layouts/PostLayout'
import { Skeleton } from '@mui/material'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { CreateStoryRequest } from '@hatsuportal/contracts'

const CreateStoryLayout: React.FC = () => {
  const [savingStory, setSavingStory] = useState(false)
  const [emptyStory, setEmptyStory] = useState<StoryViewModel | null>(StoryViewModel.createEmpty())
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom) // TODO, useMemo here also or remove from error?
  const [errorState, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const [, setSuccess] = useAtom(React.useMemo(() => successAtom, []))

  const dataServiceContext = useDataServiceContext()
  const controllersRef = useRef<AbortController[]>([])

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const setStoryAndId = (story: StoryViewModel | null) => {
    // {replace: true} to skip this change in history and thus make back button work properly
    if (story)
      navigate(
        [
          { href: '/stories', label: 'Stories' },
          { href: `/story/${story.id}`, label: `"${story.name}"` }
        ],
        { replace: true }
      )
    setEmptyStory(story)
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
        dataServiceContext.storyService
          .create(_story, { signal: controller.signal })
          .then((savedStory) => {
            setSuccess({ message: 'Story created succesfully!' })
            if (savedStory.id)
              navigate([
                { href: '/stories', label: 'Stories' },
                { href: `/story/${savedStory.id}`, label: `"${savedStory.name}"` }
              ])
          })
          .catch((error) => {
            setSavingStory(false)
            setError(error)
          })
      }
    }
  }

  return (
    <PostLayout
      viewMode={ViewModeEnum.Edit}
      layoutComponent={
        savingStory ? <Skeleton variant="rectangular" height={200} /> : <StoryCard story={emptyStory} loadingStory={false} />
      }
      editComponent={
        authState.loggedIn && (
          <StoryEdit
            story={emptyStory}
            backendStory={null}
            loadingStory={false}
            setStory={setStoryAndId}
            onCreate={onCreate}
            savingStory={savingStory}
          />
        )
      }
    />
  )
}

export default CreateStoryLayout
