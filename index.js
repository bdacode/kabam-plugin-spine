var assemblage = require('assemblage');

exports.extendCore = function (core) {
  if (core.config.redis) {
    var port = core.config.redis.port;
    var host = core.config.redis.host;
  } else {
    var port = 6379;
    var host = 'localhost';
  }
  core.spine = {};
  //DI of spine into MWC object
  if (core.config.spine && core.config.spine.domains && core.config.spine.domains instanceof Array) {
    if (core.config.spine.domains.length == 0) {
      throw new Error('Error loading config! Config.spine.domains have to be an array with at least 1 domain!')
    }
    for (var i = 0; i < core.config.spine.domains.length; i++) {
      if (/^[a-zA-Z0-9_]+$/.test(core.config.spine.domains[i])) {
        core.spine[core.config.spine.domains[i]] = assemblage.createMaster(core.config.spine.domains[i], {'port': port, 'host': host});
      } else {
        throw new Error('Error loading config! Domain ' + domains[i] + ' have wrong name. It name can be ONLY composed from A-Za-z0-9 and _');
      }
    }
  } else {
    throw new Error('Error loading config! Config.spine.domains have to be an array!');
  }
};

exports.setAppMiddlewares = function (core) {
  return function (req, res, next) {
    res.spine = core.spine;
    next();
  };
};

