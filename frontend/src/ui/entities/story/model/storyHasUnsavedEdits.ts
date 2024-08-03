import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'

function tagSignature(story: StoryViewModel): string {
  return [...story.tags]
    .map((tag) => tag.slug.toLowerCase())
    .sort()
    .join('\n')
}

function coverBase64(story: StoryViewModel): string | null {
  return story.coverImage?.base64 ?? null
}

function coversMatch(working: StoryViewModel, baseline: StoryViewModel | null): boolean {
  const w = working.coverImage
  const b = baseline?.coverImage
  if (!w && !b) {
    return true
  }
  if (!w || !b) {
    return false
  }
  if (w.id && b.id && w.id === b.id) {
    return true
  }
  return (w.base64 ?? null) === (b.base64 ?? null)
}

export function storyHasUnsavedEdits(working: StoryViewModel, baseline: StoryViewModel | null, isCreateMode: boolean): boolean {
  if (isCreateMode) {
    const blank = StoryViewModel.createEmpty()
    return (
      working.title !== blank.title ||
      working.body !== blank.body ||
      working.visibility !== blank.visibility ||
      working.tags.length > 0 ||
      !coversMatch(working, baseline)
    )
  }

  if (!baseline) {
    return false
  }

  return (
    working.title !== baseline.title ||
    working.body !== baseline.body ||
    working.visibility !== baseline.visibility ||
    tagSignature(working) !== tagSignature(baseline) ||
    coverBase64(working) !== coverBase64(baseline)
  )
}
