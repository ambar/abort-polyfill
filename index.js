/**
 * @fileoverview
 *
 * @see https://mdn.io/AbortSignal
 * @see https://github.com/nodejs/node/blob/master/lib/internal/abort_controller.js
 * @see https://github.com/denoland/deno/blob/master/op_crates/web/02_abort_signal.js
 */
function impl() {
  const hasSymbol = typeof Symbol === 'function'
  const getSymbol = hasSymbol ? Symbol : (v) => v
  const kAborted = getSymbol('kAborted')
  const kSignal = getSymbol('kSignal')

  // NOTE: not using `class extends`, making it compatible with IE 11 and Firefox 59+
  // see https://caniuse.com/mdn-api_eventtarget_eventtarget
  function AbortSignal() {
    throw new TypeError('Illegal constructor')
  }
  AbortSignal.prototype = Object.create(EventTarget.prototype, {
    constructor: {value: AbortSignal},
    aborted: {
      enumerable: true,
      get() {
        return this[kAborted]
      },
    },
  })

  const kHandlers = getSymbol('kHandlers')
  function getHandlers(self) {
    if (!self[kHandlers]) {
      self[kHandlers] = new Map()
    }
    return self[kHandlers]
  }
  function defineEventHandler(emitter, name) {
    Object.defineProperty(emitter, 'on' + name, {
      get() {
        return getHandlers(this).get(name) || null
      },
      set(value) {
        const handlers = getHandlers(this)
        if (typeof value === 'function') {
          handlers.set(name, value)
          this.addEventListener(name, value)
        } else {
          handlers.set(name, null)
        }
      },
      configurable: true,
      enumerable: true,
    })
  }

  defineEventHandler(AbortSignal.prototype, 'abort')

  function createAbortSignal() {
    let signal
    try {
      // https://caniuse.com/mdn-api_eventtarget_eventtarget
      signal = new EventTarget()
    } catch (e) {
      signal = new MessageChannel().port1
    }
    Object.setPrototypeOf(signal, AbortSignal.prototype)
    signal[kAborted] = false
    return signal
  }

  function abortSignal(signal) {
    if (signal[kAborted]) return
    signal[kAborted] = true
    // https://caniuse.com/mdn-api_event_event
    const event = new Event('abort')
    signal.dispatchEvent(event)
  }

  function AbortController() {
    this[kSignal] = createAbortSignal()
  }

  Object.defineProperties(AbortController.prototype, {
    signal: {
      enumerable: true,
      get() {
        return this[kSignal]
      },
    },
    abort: {
      enumerable: true,
      value() {
        abortSignal(this[kSignal])
      },
    },
  })

  function defineStringTag(ctor, tag) {
    if (hasSymbol && Symbol.toStringTag) {
      Object.defineProperty(ctor.prototype, Symbol.toStringTag, {value: tag})
    } else {
      Object.defineProperty(ctor.prototype, 'toString', {
        value() {
          return '[object ' + tag + ']'
        },
      })
    }
  }

  defineStringTag(AbortSignal, 'AbortSignal')
  defineStringTag(AbortController, 'AbortController')

  return {AbortController, AbortSignal}
}

const root =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof global !== 'undefined' && global)

if (!root.AbortController) {
  Object.assign(root, impl())
}
