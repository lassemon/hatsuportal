import { useEffect, useState } from 'react'

export const useOrientation = () => {
  const isPortrait = () => {
    return window.innerWidth < window.innerHeight
  }

  const [orientation, setOrientation] = useState(isPortrait() ? 'portrait' : 'landscape')

  useEffect(() => {
    function handleOrientation() {
      if (isPortrait()) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }
    window.addEventListener('resize', handleOrientation)
    return () => {
      window.removeEventListener('resize', handleOrientation)
    }
  }, [])
  return orientation
}
