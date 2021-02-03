/**
 * @fileoverview
 *
 * @see https://mdn.io/AbortSignal
 * @see https://github.com/nodejs/node/blob/master/lib/internal/abort_controller.js
 * @see https://github.com/denoland/deno/blob/master/op_crates/web/02_abort_signal.js
 */

const hasSymbol = typeof Symbol === 'function'
const getSymbol = hasSymbol ? Symbol : (v) => v
const kAborted = getSymbol('kAborted')
const kSignal = getSymbol('kSignal')

const EventLike =
  typeof EventTarget !== 'undefined'
    ? EventTarget
    : typeof MessagePort !== 'undefined'
    ? MessagePort
    : null

// NOTE: not using `class extends`, making it compatible with IE 11 and Firefox 59+
// see https://caniuse.com/mdn-api_eventtarget_eventtarget
function AbortSignal() {
  throw new TypeError('Illegal constructor')
}
AbortSignal.prototype = Object.create(EventLike.prototype, {
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
      const handler = handlers.get(name)
      if (handler) {
        this.removeEventListener(name, handler)
      }
      if (typeof value === 'function') {
        const newHandler = value.bind(this)
        handlers.set(name, newHandler)
        this.addEventListener(name, newHandler)
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
    // IE 10+ https://caniuse.com/mdn-api_messagechannel_port1
    signal = new MessageChannel().port1
  }
  Object.setPrototypeOf(signal, AbortSignal.prototype)
  signal[kAborted] = false
  return signal
}

function createEvent(type) {
  // https://caniuse.com/mdn-api_event_event
  try {
    return new Event(type)
  } catch (_) {
    // IE 9+ https://caniuse.com/customevent https://caniuse.com/mdn-api_document_createevent
    const event = document.createEvent('Event')
    event.initEvent('abort', false, false)
    return event
  }
}

function abortSignal(signal) {
  if (signal[kAborted]) return
  signal[kAborted] = true
  signal.dispatchEvent(createEvent('abort'))
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

export {AbortController, AbortSignal}
