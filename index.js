'use strict';

const bytes = require('humanize-bytes');

module.exports = (stream, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!stream.readable) return resolve();
    const maxSize = options.maxSize && bytes(options.maxSize);

    let bufs = [];
    let size = 0;
    let error;

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);
    stream.on('close', onClose);

    function onData(buf) {
      if (error) return;

      size += buf.length;
      if (size > maxSize) {
        error = new Error(`stream buffer size exceed ${options.maxSize}`);
        error.code = 'EXCEED_MAX_SIZE';
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
      if (error) reject(error);
      else resolve(Buffer.concat(bufs));
      cleanup();
    }

    function cleanup() {
      bufs = [];
      error = null;
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onEnd);
      stream.removeListener('close', onClose);
    }
  });
};
