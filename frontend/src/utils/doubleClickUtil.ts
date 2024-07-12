import { useEffect, useRef } from 'react'
import { requestTimeout } from './requestTimeout'

const noop = () => {}

const useCancelableScheduledWork = (): [(fn: any) => any, () => void] => {
  const cancelCallback = useRef(noop)
  const registerCancel = (fn: any) => (cancelCallback.current = fn)
  const cancelScheduledWork = () => cancelCallback.current()

  // Cancels the current sheduled work before the "unmount"
  useEffect(() => {
    return cancelScheduledWork
  }, [])

  return [registerCancel, cancelScheduledWork]
}

interface UseClickPreventionProps {
  onClick: any
  onDoubleClick: any
  delay?: number
}

export const useClickPrevention = ({ onClick, onDoubleClick, delay = 300 }: UseClickPreventionProps) => {
  const [registerCancel, cancelScheduledWork] = useCancelableScheduledWork()

  const handleClick = () => {
    cancelScheduledWork()
    requestTimeout(onClick, delay, registerCancel)
  }

  const handleDoubleClick = () => {
    cancelScheduledWork()
    onDoubleClick()
  }

  return [handleClick, handleDoubleClick]
}
