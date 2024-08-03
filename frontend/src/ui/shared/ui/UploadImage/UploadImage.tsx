import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import { Button } from '@mui/material'
import { ButtonProps } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { fileToBase64 } from 'utils/fileUtils'

export const useStyles = makeStyles()((theme) => ({
  uploadImageButton: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: '0',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }
  }
}))

interface UploadImageProps extends ButtonProps {
  id: string
  onUpload: (base64: string, size: number, mimeType: string) => void
  children: React.ReactNode
}

export const UploadImage: React.FC<UploadImageProps> = ({ id, onUpload, children, ...passProps }) => {
  const { classes } = useStyles()
  const internalOnUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist()
    const file = event.target.files?.[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    onUpload(base64, file.size, file.type)
    event.target.value = ''
  }

  return (
    <Button component="label" htmlFor={id} endIcon={<AddPhotoAlternateIcon />} {...passProps} className={classes.uploadImageButton}>
      <input id={id} type="file" accept="image/*" name="image" hidden style={{ display: 'none' }} onChange={internalOnUpload} />
      {children}
    </Button>
  )
}
