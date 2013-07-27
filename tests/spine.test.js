var vows = require('vows'),
  assert = require('assert'),
  mwcCore = require('mwc_kernel'),
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

var MWC = new mwcCore(config);
MWC.usePlugin(mwc_plugin_spine);
MWC.listen(3000);

vows.describe('mwc_plugin_spine')
  .addBatch({
    'mwc_plugin_spine have properly exposed internals': {
      'topic': mwc_plugin_spine,
      'it should have a extendCore(core) function': function (topic) {
        assert.isFunction(topic.extendCore);
      },
      'it should have a extendMiddlewares(core) function': function (topic) {
        assert.isFunction(topic.extendMiddlewares);
      },
      'it should not have other functions': function (topic) {
        assert.isUndefined(topic.extendApp);
        assert.isUndefined(topic.extendRoutes);
      }
    },
    'mwc_plugin_spine extends mwcCore': {
      'topic': function () {
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
        assert.equal(topic.extendMiddlewaresFunctions[0].SettingsFunction, mwc_plugin_spine.extendMiddlewares);
      }
    },
    'mwc_plugin_spine works': {
      'topic': function () {
        var promise = new (events.EventEmitter),
          worker = assemblage.createWorker('urgentTasks', {'port': MWC.config.redis.port, 'host': MWC.config.redis.host, prefix:''});

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
            assert.isString(jobId, 'Job.id is not string!');
            assert.isTrue(jobId.length > 3, 'Job.id is too short!');
          });
        }, 500);

        return promise;
      },
      'it issues task that assemblage understands': function (job) {
        //console.log(job);
        assert.isString(job.id, 'Job.id is not string!');
        assert.isTrue(job.id.length > 3, 'Job.id is too short!');

        assert.isObject(job.payload, 'job.payload do not exits!');
        assert.deepEqual(job.payload, payload, 'We recieved not the message we wanted');
        job.deleteJob(function () {
          console.log('Job ' + job.id + ' deleted');
        });
      }

    }
  })
  .export(module);

