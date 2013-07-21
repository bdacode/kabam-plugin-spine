var vows = require('vows'),
  assert = require('assert'),
  mwcCore = require('mwc_core'),
  mwc_plugin_spine = require('./../index.js'),
  assemblage = require('assemblage'),
  events = require('events'),
  payload = {
    _worker: Math.floor(Math.random() * 9999),
    key1: 'fgdffg' + Math.floor(Math.random() * 9999),
    key2: [1, 2, 3, 4, 5],
    key3: {
      doOnce: 1,
      doSecond: 2
    }
  },
  config = require('./../example/config.json')['development'];

vows.describe('mwc_plugin_spine')
  .addBatch({
    'mwc_plugin_spine have properly exposed internals': {
      'topic': mwc_plugin_spine,
      'it should have a extendCore(core) function': function (topic) {
        assert.isFunction(topic.extendCore);
      },
      'it should have a setAppMiddlewares(core) function': function (topic) {
        assert.isFunction(topic.setAppMiddlewares);
      },
      'it should not have other functions': function (topic) {
        assert.isUndefined(topic.setAppParameters);
        assert.isUndefined(topic.extendAppRoutes);
      }
    },
    'mwc_plugin_spine extends mwcCore': {
      'topic': function () {
        var MWC = new mwcCore(config);
        MWC.usePlugin(mwc_plugin_spine);
        MWC.listen(3000);
        return MWC;
      },
      'MWC application have exposed .spine object': function (topic) {
        assert.isObject(topic.spine);
      },
      'MWC application have exposed objects for every task queue mentioned in config': function (topic) {
        assert.isFunction(topic.spine.urgentTasks.addJob);
        assert.isFunction(topic.spine.veryUrgentTasks.addJob);
        assert.isFunction(topic.spine.lessUrgentTasks.addJob);
        assert.isFunction(topic.spine.tasksToForgetAbout.addJob);
      },
      'MWC application have spine middleware installed as first and only middleware': function (topic) {
        assert.equal(topic.setAppMiddlewaresFunctions[0].SettingsFunction, mwc_plugin_spine.setAppMiddlewares);
      }
    },
    'mwc_plugin_spine works': {
      'topic': function () {
        var promise = new (events.EventEmitter),
          MWC = new mwcCore(config),
          worker = assemblage.createWorker('urgentTasks', {'port': MWC.config.redis.port, 'host': MWC.config.redis.host, prefix:''});

        MWC.usePlugin(mwc_plugin_spine);
        MWC.listen(3000);

        MWC.on('error',function(err){
          throw err;
        });
        worker.on('add', function (job) {
          promise.emit('success', job);
        });
        setTimeout(function () {
          MWC.spine.urgentTasks.addJob(payload, function (err, jobId) {
            if (err) {
              throw err;
            }
            assert.isString(jobId, 'JobId is not string!');
            assert.isTrue(jobId.length > 3, 'Job id is too short!');
          });
        }, 500);

        return promise;
      },
      'it issues task that assemblage understands': function (job) {
        console.log(job);
        assert.isObject(job.payload, 'job.payload do not exits!');
        assert.deepEqual(job.payload, payload, 'We recieved not the message we wanted');
        job.deleteJob(function () {
          console.log('Job ' + job.id + ' deleted');
        });
      }

    }
  })
  .export(module);

