export const scheduleAsyncFunction = async (
  asyncFunction: () => Promise<any> | any,
  timeout: number,
  shouldContinue: () => boolean,
  setTimeoutId: (id: NodeJS.Timeout | undefined) => void,
  setCurrentPromise: (promise: Promise<any>) => void
) => {
  if (shouldContinue()) {
    const promise = Promise.resolve(asyncFunction()).finally(() => {
      const timeoutId = setTimeout(scheduleAsyncFunction, timeout, asyncFunction, timeout, shouldContinue, setTimeoutId, setCurrentPromise)
      setTimeoutId(timeoutId)
    })
    setCurrentPromise(promise)
  }
}
