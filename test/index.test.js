'use strict';

const streamToBuffer = require('../');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('stream-to-buf', () => {
  it('should collect buffer success', async () => {
    const small = fs.createReadStream(path.join(__dirname, 'fixtures/smallfile'));
    let buffer = await streamToBuffer(small);
    assert(buffer.length === 1024);

    const big = fs.createReadStream(path.join(__dirname, 'fixtures/bigfile'));
    buffer = await streamToBuffer(big);
    assert(buffer.length === 102400);
  });

  it('should return undefined if not readable', async () => {
    const buffer = await streamToBuffer('foo');
    assert(!buffer);
  });

  it('should collect buffer with maxSize', async () => {
    const small = fs.createReadStream(path.join(__dirname, 'fixtures/smallfile'));
    const big = fs.createReadStream(path.join(__dirname, 'fixtures/bigfile'));
    const buffer = await streamToBuffer(small, { maxSize: '2kb' });
    assert(buffer.length === 1024);
    try {
      await streamToBuffer(big, { maxSize: '2kb' });
      throw new Error('should not execute');
    } catch (err) {
      assert(err.message === 'entity size exceed 2kb');
      assert(err.code === 'ENTITY_TOO_LARGE');
      assert(err.status === 413);
    }
  });

  it('should throw end by error', async () => {
    const stream = fs.createReadStream(path.join(__dirname, 'fixtures/bigfile'));
    setImmediate(() => {
      stream.emit('error', new Error('mock error'));
    });
    try {
      await streamToBuffer(stream);
      throw new Error('should not execute');
    } catch (err) {
      assert(err.message === 'mock error');
    }
  });
});
