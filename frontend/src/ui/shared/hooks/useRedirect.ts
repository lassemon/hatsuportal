import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { authAtom } from 'ui/entities/user/state/authAtom'

export const useRedirectToFrontPageIfNotLoggedIn = () => {
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom)

  if (!authState.loggedIn) {
    navigate('/')
  }
}
