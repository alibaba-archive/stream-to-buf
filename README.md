stream-to-buf
====

Collect a readable stream's data into buffer. Support max size limit.

## Install

```bash
npm i stream-to-buf
```

## Usage

```js
const streamTobuffer = require('stream-to-buf');

const stream = fs.createReadStream(path.join(__dirname, 'fixtures/file'));
streamToBuffer(stream, { maxSize: '10kb' }).then(onBuffer, onError);
```

### Options

- `maxSize`: If stream's emitted buffer exceed `maxSize`, it will throw an error.(but it will still consume the stream before resolve).
