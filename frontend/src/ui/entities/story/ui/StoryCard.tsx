import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { Box, darken, lighten, Typography } from '@mui/material'
import { useAtom } from 'jotai'
import { localStorageColorSchemeAtom } from 'ui/shared/state/displayPreferencesAtoms'
import React from 'react'
import { Chip } from 'ui/shared/ui/Chip'
import { Markdown } from 'ui/shared/ui/Markdown'
import { ColorSchemeEnum } from '@hatsuportal/common'
import Panel from 'ui/shared/ui/Panel/Panel'
import { useSize } from 'ui/shared/hooks/useSize'
import { StoryCoverUnsavedBar } from './StoryCoverUnsavedBar'

interface StoryCardProps {
  story: StoryViewModel | null
  loadingStory?: boolean
  savingStory?: boolean
  hasUnsavedChanges?: boolean
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, loadingStory = false, savingStory = false, hasUnsavedChanges = false }) => {
  if (!story) return null

  const [colorScheme] = useAtom(localStorageColorSchemeAtom)

  const { isSmall } = useSize()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.background.paper,
        minHeight: '10em',
        height: '100%',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          minHeight: '12em',
          width: '100%',
          zIndex: 0,
          display: 'flex',
          alignItems: 'flex-end',
          position: 'relative',
          background: (theme) =>
            `linear-gradient(110deg, ${theme.palette.action.active} 49%, ${darken(theme.palette.action.active, 0.1)}  50%, ${darken(
              theme.palette.action.active,
              0.1
            )} 52%, ${lighten(theme.palette.action.active, 0.8)} 53%, ${lighten(theme.palette.action.active, 0.8)} 0)`,
          ...(story.coverImage?.base64 && { backgroundImage: `url(${story.coverImage.base64})` }),
          backgroundSize: 'cover',
          backgroundPosition: 'center 10%'
        }}
      >
        <StoryCoverUnsavedBar visible={hasUnsavedChanges} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5em',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0.5em 0 0 0.5em'
          }}
        >
          <Typography
            variant="h4"
            paragraph={false}
            sx={{
              color: (theme) => theme.palette.grey[50],
              padding: '0 0 0.2em 0',
              textShadow: (theme) => `1px 1px 1px ${theme.palette.grey[800]}`
            }}
          >
            {story.title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '0.5em',
              alignItems: 'center',
              alignContent: 'flex-end',
              padding: '0 0 0.5em 0'
            }}
          >
            {story.tags.map((tag) => (
              <Chip size="small" key={tag.id} label={tag.name} />
            ))}
          </Box>
        </Box>
      </Box>
      <Panel sx={{ height: '100%', borderRadius: isSmall ? 0 : (theme) => `0 0 ${theme.spacing(2)} ${theme.spacing(2)}` }}>
        {!story.title && !story.body ? (
          <Typography
            variant="h4"
            color={(theme) => theme.palette.grey[colorScheme === ColorSchemeEnum.Dark ? 800 : 400]}
            paragraph={false}
            sx={{ flex: 1, alignSelf: 'center', textAlign: 'center', zIndex: 1 }}
          >
            Empty Story
          </Typography>
        ) : (
          <Box sx={{ flex: '1 1 60%', zIndex: 1, padding: '0.5em 0.5em 0 1em' }}>
            <Typography variant="body1" paragraph={false} component={'div'}>
              <Markdown>{story.body}</Markdown>
            </Typography>
          </Box>
        )}
      </Panel>
    </Box>
  )
}

export default StoryCard
