'use strict';

const expect = require('expect.js');

const connectDatadog = require('../lib/index');

describe('connect datadog middleware', () => {
  let req;
  let res;
  let next;
  let nextCalled = false;
  beforeEach(() => {
    req = {};
    res = { end: () => { } };
    next = () => nextCalled = true;
  });

  let histogramCalledWith;
  const datadogMock = {
    increment: () => { },
    histogram: (stat, responseTime, sampleRate, tags) => {
      histogramCalledWith = { stat, responseTime, sampleRate, tags };
    },
  };

  describe('middleware', () => {
    it('emits no events when there is no path set', () => {
      const middleware = connectDatadog.middleware({ dogstatsd: datadogMock });
      middleware(req, res, next);
      res.end();
      expect(nextCalled).to.be(true);
    });

    it('attaches metadata', () => {
      const middleware = connectDatadog.middleware({ dogstatsd: datadogMock, path: true });
      req.route = { path: 'test' };
      middleware(req, res, next);
      res.end();
      expect(histogramCalledWith.stat).to.be.ok();
    });
  });


  describe('generateStatTags', () => {
    const generateStatTags = connectDatadog.generateStatTags;
    it('attaches status:success on success', () => {
    });

    it('attaches status:error on error', () => {
    });

    it('attaches tags dynamically', () => {
    });
  });
});
