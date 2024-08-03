const noop = () => {}

export const requestTimeout = (fn: any, delay: number, registerCancel: any) => {
  const start = new Date().getTime()

  const loop = () => {
    const delta = new Date().getTime() - start

    if (delta >= delay) {
      fn()
      registerCancel(noop)
      return
    }

    const raf = requestAnimationFrame(loop)
    registerCancel(() => cancelAnimationFrame(raf))
  }

  const raf = requestAnimationFrame(loop)
  registerCancel(() => cancelAnimationFrame(raf))
}
