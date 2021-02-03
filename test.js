/**
 * @jest-environment node
 */
import {test, expect} from '@jest/globals'
import 'event-target-polyfill'
import './index'

test('constructs correctly', () => {
  const ac = new AbortController()
  expect(ac).toBeInstanceOf(AbortController)
  expect(ac.signal).toBeInstanceOf(AbortSignal)
  expect(ac.signal).toBeInstanceOf(EventTarget)
  expect(AbortSignal.prototype).not.toBe(EventTarget.prototype)
  expect(ac.toString()).toBe('[object AbortController]')
  expect(ac.signal.toString()).toBe('[object AbortSignal]')
  expect(Object.keys(ac.__proto__).sort()).toStrictEqual(['abort', 'signal'])
  expect(Object.keys(ac.signal.__proto__).sort()).toStrictEqual([
    'aborted',
    'onabort',
  ])
  expect(() => new AbortSignal()).toThrow(/Illegal constructor/)
})

test('calls abort event', () => {
  {
    const ac = new AbortController()
    let event
    const handler = jest.fn((e) => (event = e))
    ac.signal.onabort = handler
    ac.abort()
    ac.abort()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(event).toMatchObject({type: 'abort'})
    expect(ac.signal.aborted).toBe(true)
  }

  {
    const ac = new AbortController()
    let event
    const handler = jest.fn((e) => (event = e))
    ac.signal.addEventListener('abort', handler)
    ac.signal.addEventListener('abort', handler)
    ac.abort()
    ac.abort()
    expect(handler).toHaveBeenCalledTimes(1)
    expect(event).toMatchObject({type: 'abort'})
    expect(ac.signal.aborted).toBe(true)
  }

  {
    const ac = new AbortController()
    ac.abort()
    const handler = jest.fn()
    ac.signal.addEventListener('abort', handler)
    ac.abort()
    expect(handler).toHaveBeenCalledTimes(0)
  }

  {
    const ac = new AbortController()
    const handler = jest.fn()
    ac.signal.onabort = handler
    ac.signal.addEventListener('abort', handler)
    ac.abort()
    ac.abort()
    expect(handler).toHaveBeenCalledTimes(2)
  }
})
