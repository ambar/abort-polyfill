import {AbortSignal, AbortController} from './abort'
import {abortable} from './fetch'

const root =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  (typeof global !== 'undefined' && global)

if (!root.AbortController) {
  Object.assign(root, {AbortSignal, AbortController})
}

if (root.fetch) {
  root.fetch = abortable(root.fetch)
}
