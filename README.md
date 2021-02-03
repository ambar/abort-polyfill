# abort-polyfill

- Polyfill AbortController and AbortSignal
- Polyfill signal options to legacy fetch

[![abort-polyfill](https://badgen.net/bundlephobia/minzip/abort-polyfill)](https://bundlephobia.com/result?p=abort-polyfill)

## Install

```
npm install abort-polyfill
```

## Usage

Any browsers (IE 10+):

```js
import 'cross-fetch/polyfill'
import 'abort-polyfill'
```

Node < 15:

```js
import 'cross-fetch/polyfill'
import 'event-target-polyfill'
import 'abort-polyfill'
```

Node >= 15:

```js
import 'cross-fetch/polyfill'
// no need to import polyfill
```
