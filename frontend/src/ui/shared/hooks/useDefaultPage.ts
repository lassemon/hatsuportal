import { useEffect } from 'react'
import { useNavigate } from './useNavigate'

const DEFAULT_PAGE = [{ label: 'Home', href: '/' }]

export const useDefaultPage = (condition?: boolean) => {
  const navigate = useNavigate()

  const goToDefaultPage = () => {
    navigate(DEFAULT_PAGE)
  }

  useEffect(() => {
    if (condition === true) {
      navigate(DEFAULT_PAGE)
    }
  }, [condition])

  return goToDefaultPage
}

export default useDefaultPage
