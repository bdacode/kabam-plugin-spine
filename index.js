var assemblage = require('assemblage');
exports.name = 'kabamPluginSpine';
exports.core = {'spine': function (config) {

  var spine = {};
  //DI of spine into MWC object
  if (config.spine && config.spine.domains instanceof Array) {
    if (config.spine.domains.length == 0) {
      throw new Error('Error loading config! Config.spine.domains have to be an array with at least 1 domain!');
    }

    config.spine.domains.map(function (domain) {
      if (/^[a-zA-Z0-9_]+$/.test(domain)) {
        spine[domain] = assemblage.createMaster(domain);
      } else {
        throw new Error('Error loading config! Domain ' + domain + ' have wrong name. It name can be ONLY composed from A-Za-z0-9 and _');
      }
    });

    return spine;
  } else {
    throw new Error('Error loading config! Config.spine.domains have to be an array!');
  }

}};

exports.middleware = function (core) {
  return function (req, res, next) {
    res.spine = core.kabamPluginSpine.spine;
    next();
  };
};

