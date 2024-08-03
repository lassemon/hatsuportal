import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import PostLayout from 'ui/blocks/PostLayout'
import StoryEdit from 'ui/features/edit-story/ui/StoryEdit'
import { useStory } from 'ui/entities/story/hooks/useStory'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { UserViewModel } from 'ui/entities/user/model/UserViewModel'
import { useAtom, useSetAtom } from 'jotai'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { successAtom } from 'ui/shared/state/successAtom'
import { unstable_batchedUpdates } from 'react-dom'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { UpdateStoryRequest } from '@hatsuportal/contracts'
import { ViewStoryLayout } from 'ui/blocks/ViewStoryLayout'
import { storyViewModeAtom } from 'ui/entities/story/model/storyViewModeAtom'
import { storyHasUnsavedEdits } from 'ui/entities/story/model/storyHasUnsavedEdits'

const StoryPage: React.FC = () => {
  let { storyId: urlStoryId } = useParams<{ storyId: string }>()
  const [storyUpdateInProgress, setStoryUpdateInProgress] = useState(false)
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom)

  const entityServiceContext = useEntityServiceContext()
  const controllersRef = useRef<AbortController[]>([])

  const [errorState, setError] = useAtom(errorAtom)
  const setSuccess = useSetAtom(successAtom)

  // TODO, useStory, duplicated with EditStoryLayout ???
  const [{ story, backendStory, loadingStory, setBackendStory }, setStory] = useStory(entityServiceContext.storyService, urlStoryId, {
    persist: true
  })

  const hasUnsavedChanges = !!story && storyHasUnsavedEdits(story, backendStory, false)

  const [viewModesByStoryId, setViewModesByStoryId] = useAtom(storyViewModeAtom)

  const viewMode =
    urlStoryId &&
    viewModesByStoryId[urlStoryId] === ViewModeEnum.Edit &&
    (authState.user?.id === story?.createdById || UserViewModel.isAdmin(authState.user))
      ? ViewModeEnum.Edit
      : ViewModeEnum.View

  const onToggleViewMode = () => {
    if (!urlStoryId) {
      return
    }
    if (!(authState.user?.id === story?.createdById || UserViewModel.isAdmin(authState.user))) {
      return
    }
    const nextMode = viewMode === ViewModeEnum.View ? ViewModeEnum.Edit : ViewModeEnum.View
    setViewModesByStoryId({ ...viewModesByStoryId, [urlStoryId]: nextMode })
  }

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
          { href: `/story/${story.id}`, label: `"${story.title}"` }
        ],
        { replace: true }
      )
    setStory(story)
  }

  const onUpdate = (updatePayload: UpdateStoryRequest, callback?: () => void) => {
    if (story && updatePayload) {
      if (errorState) {
        setError(null)
      }
      if (authState.loggedIn && authState.user) {
        const controller = new AbortController()
        controllersRef.current.push(controller)
        setStoryUpdateInProgress(true)
        entityServiceContext.storyService
          .update(story.id, updatePayload, { signal: controller.signal })
          .then((savedStory) => {
            unstable_batchedUpdates(() => {
              setBackendStory(savedStory)
              setStory(savedStory)
              setSuccess({ message: `Story "${savedStory.title}" saved succesfully!` })
            })
          })
          .catch((error) => {
            setError(error)
          })
          .finally(() => {
            if (callback) {
              callback()
            }
            setStoryUpdateInProgress(false)
          })
      }
    }
  }

  const deleteStory = () => {
    if (authState.loggedIn && authState.user && story) {
      const deletedTitle = story.title
      const controller = new AbortController()
      controllersRef.current.push(controller)
      setStoryUpdateInProgress(true)
      entityServiceContext.storyService
        .delete(story.id, { signal: controller.signal })
        .then(() => {
          setSuccess({ message: `Story "${deletedTitle}" deleted succesfully!` })
          navigate([{ href: '/stories', label: 'Stories' }])
        })
        .catch((error) => {
          setError(error)
        })
        .finally(() => {
          setStoryUpdateInProgress(false)
        })
    }
  }

  return (
    <PostLayout
      viewMode={viewMode}
      layoutComponent={
        <ViewStoryLayout
          story={story}
          loadingStory={loadingStory}
          hasUnsavedChanges={hasUnsavedChanges}
          onToggleViewMode={onToggleViewMode}
        />
      }
      editComponent={
        (authState.user?.id === story?.createdById || UserViewModel.isAdmin(authState.user)) && (
          <StoryEdit
            story={story}
            backendStory={backendStory}
            loadingStory={loadingStory}
            setStory={setStoryAndId}
            savingStory={storyUpdateInProgress}
            onUpdate={onUpdate}
            onClose={onToggleViewMode}
            deleteStory={deleteStory}
          />
        )
      }
    />
  )
}

export default StoryPage
