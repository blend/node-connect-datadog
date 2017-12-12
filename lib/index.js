var DD = require("node-dogstatsd").StatsD;

function generateStatTags(req, res, options) {
  const baseUrl = (options.base_url !== false) ? req.baseUrl : '';
  var statTags = [
    "route:" + baseUrl + req.route.path
  ].concat(options.tags);

  if (options.method) {
    statTags.push("method:" + req.method.toLowerCase());
  }

  if (options.protocol && req.protocol) {
    statTags.push("protocol:" + req.protocol);
  }

  if (options.path !== false) {
    statTags.push("path:" + baseUrl + req.path);
  }

  statTags.push("status:" + (() => {
    if (res.statusCode >= 400) {
      return 'error';
    }
    return 'success';
  })());

  if (options.dynamic_tags && req.tags) {
    statTags = statTags.concat(req.tags);
  }

  if (options.response_code) {
    statTags.push("response_code:" + res.statusCode);
  }

  return statTags;
}

function middleware(options) {
  const defaultedOptions = {
    datadog: options.dogstatsd || new DD(),
    stat: options.stat || "node.express.router",
    tags: options.tags || [],
    path: options.path || false,
    base_url: options.base_url || false,
    response_code: options.response_code || false,
    dynamic_tags: options.dynamic_tags || false,
    method: options.method || false,
    protocol: options.protocol || false,
  };

  return function (req, res, next) {
    if (!req._startTime) {
      req._startTime = new Date();
    }

    var end = res.end;
    res.end = function (chunk, encoding) {
      res.end = end;
      res.end(chunk, encoding);

      if (!req.route || !req.route.path) {
        return;
      }

      const statTags = generateStatTags(req, res, defaultedOptions);

      if (defaultedOptions.response_code) {
        defaultedOptions.datadog.increment(defaultedOptions.stat + '.response_code.' + res.statusCode , 1, statTags);
        defaultedOptions.datadog.increment(defaultedOptions.stat + '.response_code.all' , 1, statTags);
      }

      defaultedOptions.datadog.histogram(defaultedOptions.stat + '.response_time', (new Date() - req._startTime), 1, statTags);
    };

    next();
  };
}

module.exports = {
  middleware,

  // For test only
  generateStatTags,
};
