'use strict';

const _ = require('lodash');
const expect = require('expect.js');

const connectDatadog = require('../lib/index');

describe('connect datadog middleware', () => {
  let req;
  let res;
  let next;
  let nextCalled = false;
  beforeEach(() => {
    req = { route: { path: 'test' } };
    res = { end: () => { } };
    next = () => nextCalled = true;
  });

  let histogramCalledWith = { };
  const datadogMock = {
    increment: () => { },
    histogram: (stat, responseTime, sampleRate, tags) => {
      histogramCalledWith = { stat, responseTime, sampleRate, tags };
    },
  };

  describe('middleware', () => {
    it('emits no events when there is no path set', () => {
      const req = { };
      const middleware = connectDatadog.middleware({ dogstatsd: datadogMock });
      middleware(req, res, next);
      res.end();
      expect(nextCalled).to.be(true);
      expect(histogramCalledWith).to.eql({});
    });

    it('attaches metadata', () => {
      const middleware = connectDatadog.middleware({ dogstatsd: datadogMock, path: true });
      middleware(req, res, next);
      res.end();
      expect(histogramCalledWith.stat).to.be.ok();
    });
  });


  describe('generateStatTags', () => {
    const generateStatTags = connectDatadog.generateStatTags;
    it('attaches status:success on success', () => {
      const statTags = generateStatTags(req, {
        statusCode: 200,
      }, { });
      const statusTag = _.find(statTags, tag => /status/.test(tag));
      expect(statusTag).to.be('status:success');
    });

    it('attaches status:error on error', () => {
      const statTags = generateStatTags(req, {
        statusCode: 404,
      }, { });
      const statusTag = _.find(statTags, tag => /status/.test(tag));
      expect(statusTag).to.be('status:error');
    });

    it('attaches tags dynamically', () => {
    });
  });
});
