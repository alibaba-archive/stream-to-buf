'use strict';

const bytes = require('humanize-bytes');

module.exports = (stream, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!stream.readable) return resolve();
    const maxSize = options.maxSize && bytes(options.maxSize);

    const bufs = [];
    let size = 0;
    let error;

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);
    stream.on('close', onClose);

    function onData(buf) {
      if (error) return;

      size += buf.length;
      if (maxSize && size > maxSize) {
        error = new Error(`entity size exceed ${options.maxSize}`);
        error.code = 'ENTITY_TOO_LARGE';
        // usualy use in parse http request so we set status = 413
        error.status = 413;
        return;
      }
      bufs.push(buf);
    }

    function onEnd(err) {
      if (err instanceof Error) error = err;
      done();
    }

    function onClose() {
      done();
    }

    function done() {
      cleanup();
      if (error) reject(error);
      else resolve(Buffer.concat(bufs));
    }

    function cleanup() {
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onEnd);
      stream.removeListener('close', onClose);
    }
  });
};
