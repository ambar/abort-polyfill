export const abortable = (fetch) => {
  const hasNativeSupport =
    typeof Request === 'function' && 'signal' in Request.prototype
  if (!hasNativeSupport) {
    return fetch
  }

  const createError = () => {
    try {
      return new DOMException('Aborted', 'AbortError')
    } catch (_) {
      const error = new Error('Aborted')
      error.name = 'AbortError'
      return error
    }
  }

  return (url, {signal, ...options}) => {
    if (!signal) {
      return fetch(url, options)
    }

    if (signal.aborted) {
      return Promise.reject(createError())
    }

    const abort = new Promise((resolve, reject) => {
      signal.addEventListener('abort', function handler() {
        signal.addEventListener('abort', handler)
        reject(createError())
      })
    })

    return Promise.race([abort, fetch(url, options)])
  }
}
