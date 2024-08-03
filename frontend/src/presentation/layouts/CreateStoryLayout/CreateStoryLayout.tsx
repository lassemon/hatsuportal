import React, { useEffect, useRef, useState } from 'react'

import { useDataServiceContext } from 'infrastructure'
import StoryCard from 'presentation/components/Story/StoryCard'
import StoryEdit from 'presentation/components/Story/StoryEdit'
import { StoryPresentation } from '@hatsuportal/presentation-post'
import { useAtom } from 'jotai'
import { authAtom, errorAtom, successAtom } from 'application'
import PostLayout from 'presentation/layouts/PostLayout'
import { Skeleton } from '@mui/material'
import { useNavigate } from 'presentation/hooks/useNavigate'

const CreateStoryLayout: React.FC = () => {
  const [savingStory, setSavingStory] = useState(false)
  const [emptyStory, setEmptyStory] = useState<StoryPresentation | null>(StoryPresentation.createEmpty())
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

  const setStoryAndId = (story: StoryPresentation | null) => {
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

  const onCreate = (_story: StoryPresentation | null) => {
    if (_story) {
      if (errorState) {
        setError(null)
      }
      setEmptyStory(_story)
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
            onSave={onCreate}
            savingStory={savingStory}
          />
        )
      }
    />
  )
}

export default CreateStoryLayout
