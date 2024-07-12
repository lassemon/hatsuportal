import { SearchItemsRequestDTO } from '@hatsuportal/application'
import { Item } from '@hatsuportal/domain'
import { Box, Skeleton, TablePagination } from '@mui/material'
import { TablePaginationActions } from 'components/ItemTable/TablePaginationActions'

interface ItemGridProps {
  items: Item[]
  loading: boolean
  totalCount: number
  pageNumber: number
  itemsPerPage: number
  setItemTableFilters: React.Dispatch<React.SetStateAction<SearchItemsRequestDTO>>
  goToItem: (itemId?: string) => void
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  loading,
  totalCount,
  pageNumber,
  itemsPerPage,
  setItemTableFilters,
  goToItem
}) => {
  const handleChangePage = (event: unknown, newPage: number) => {
    setItemTableFilters((_itemTableFilters) => {
      return {
        ..._itemTableFilters,
        pageNumber: newPage
      }
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemTableFilters((_itemTableFilters) => {
      return {
        ..._itemTableFilters,
        itemsPerPage: +event.target.value,
        pageNumber: 0
      }
    })
  }

  return (
    <Box>
      <Box
        sx={{
          margin: '0 0 0 0',
          display: 'grid',
          gridTemplateColumns: `repeat(${loading ? '6, 0fr' : 'auto-fill, minmax(180px, 1fr)'})`,
          gap: '1em',
          padding: '1em'
        }}
      >
        {loading
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
          : items.map((item, index) => {
              return (
                <div key={`${item.id}-${index}`} onClick={() => goToItem(item.id)}>
                  {item.id}
                </div>
              )
            })}
      </Box>
      <TablePagination
        component="div"
        labelRowsPerPage="Items per page"
        disabled={loading}
        rowsPerPageOptions={[2, 10, 25, 50, 75, 100, 200]}
        count={totalCount}
        rowsPerPage={itemsPerPage}
        page={pageNumber}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </Box>
  )
}

export default ItemGrid
