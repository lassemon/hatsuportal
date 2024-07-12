import { Item } from '@hatsuportal/domain'
import { Box, Skeleton } from '@mui/material'
import PageHeader from 'components/PageHeader'
import { authAtom, errorAtom } from 'infrastructure/dataAccess/atoms'
import { useAtom } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import ItemApiService from 'services/ItemApiService'

const itemApiService = new ItemApiService()

const MyItemsPage: React.FC = () => {
  const [loadingMyItems, setLoadingMyItems] = useState(true)
  const [myItems, setMyItems] = useState<Item[]>([])
  const [authState] = useAtom(authAtom)
  const navigate = useNavigate()
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))

  const myItemsRequestControllerRef = useRef<AbortController | null>(null)

  const goToItem = (itemId?: string) => {
    if (itemId) {
      navigate(`/card/item/${itemId}`)
    }
  }

  useEffect(() => {
    if (!authState.loggedIn) {
      navigate(`/`)
    } else {
      const fetchAndSetPageStats = async () => {
        try {
          setLoadingMyItems(true)
          const controller = new AbortController()
          myItemsRequestControllerRef.current = controller

          const myItemsResponse = await itemApiService
            .myitems({ signal: controller.signal })
            .finally(() => {
              setLoadingMyItems(false)
            })
            .catch((error) => {
              setError(error)
              return null
            })
          if (myItemsResponse) {
            unstable_batchedUpdates(() => {
              setMyItems(myItemsResponse.map((item) => new Item(item)))
            })
          }
        } catch (error) {
          setLoadingMyItems(false)
          console.error('Failed to fetch page stats', error)
        }
      }

      fetchAndSetPageStats()
    }
  }, [authState.loggedIn])

  useEffect(() => {
    return () => {
      myItemsRequestControllerRef?.current?.abort()
    }
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 100%',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ margin: '2em 1em 1em 2em' }}>
        <PageHeader>My Items</PageHeader>
        <Box
          sx={{
            margin: '2em 0 0 0',
            display: 'grid',
            gridTemplateColumns: `repeat(${loadingMyItems ? '6, 0fr' : 'auto-fill, minmax(180px, 1fr)'})`,
            gap: '1em',
            padding: '1em'
          }}
        >
          {loadingMyItems
            ? Array.from(Array(6).keys()).map((index) => {
                return (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={120}
                    height={120}
                    animation="wave"
                    sx={{ margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)', opacity: 1.0 - index * 0.2 }}
                  />
                )
              })
            : myItems.map((item, index) => {
                return (
                  <div key={`${item.id}-${index}`} onClick={() => goToItem(item.id)}>
                    {item.id}
                  </div>
                )
              })}
        </Box>
      </Box>
    </Box>
  )
}

export default MyItemsPage
