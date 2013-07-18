mwc_plugin_spine
=================

MyWebClass mwc_core plugin for task queue.


Example
=================

```javascript

    var mwc_core = require('mwc_core'),
        assemblage = require('assemblage');//for worker only

    //setting up the config
    var MWC = new mwc_core(require('./config.json')[(process.env.NODE_ENV) ? (process.env.NODE_ENV) : 'development']);

    //starting spine task for queue 'urgentTasks'. Every 3 seconds it will emit the tasks
    setInterval(function () {
        MWC.spine.urgentTasks.addJob({
                'one': 1,
                'two': 2,
                'letters': ['a', 'b', 'c'],
                'object': {'partA': 'partA', 'partB': 'partB'}
            }, function (err, jobId) {
                if (err) {
                    throw err;
                }
                console.log("Created JOB %s", jobId);
            }
        );
    }, 3000);


    //this is a background worker for this task.
    var worker = assemblage.createWorker('urgentTasks');
    worker.on('add', function (job) {
        console.log('Job recieved!');
        console.log(job.payload);
    });


```

Configuration
=================
This plugin reacts on the part of `spine` of config object.
This is contents of example config file

```json

    {
        "development":{
        "hostUrl":"http://vvv.msk0.ru/",
        "secret":"hammer on the keyboard",
        "mongo_url":"mongodb://localhost/test",
        "redis":{
            "port": 6379,
            "host": "localhost"
        },
        "spine":{
            "domains":["urgentTasks","veryUrgentTasks","lessUrgentTasks","tasksToForgetAbout"]
        }
        },
        "production":{
            "hostUrl":"http://localhost/",
            "secret":"hammer on the keyboard",
            "mongo_url":"mongodb://localhost/test",
            "redis":{
                "port": 6379,
                "host": "localhost"
            },
            "spine":{
                "domains":["urgentTasks","veryUrgentTasks","lessUrgentTasks","tasksToForgetAbout"]
            }
        },
        "staging":{
            "hostUrl":"http://localhost/",
            "secret":"hammer on the keyboard",
            "mongo_url":"mongodb://localhost/test",
            "redis":{
                "port": 6379,
                "host": "localhost"
            },
            "spine":{
                "domains":["urgentTasks","veryUrgentTasks","lessUrgentTasks","tasksToForgetAbout"]
            }

        }
    }

```

The `domains` variables are the clusterId [https://github.com/pipedrive/assemblage#master](https://github.com/pipedrive/assemblage#master)
for every assemblage master module need to be created and imported in MWC application.
The result of importing of this module is new internal object of MWC are:

1. `MWC.spine`, which consists of Assemblage masters for domains(clusterId) mentioned
   `MWC.spine.urgentTasks`,`MWC.spine.veryUrgentTasks`,`MWC.spine.lessUrgentTasks`,`MWC.spine.tasksToForgetAbout`
2. ExpressJS object of request will have propery of `request.spin`, which consists of Assemblage
masters for domains(clusterId) mentioned `MWC.spine.urgentTasks`,`MWC.spine.veryUrgentTasks`,
`MWC.spine.lessUrgentTasks`,`MWC.spine.tasksToForgetAbout`.








Disclaimer
=================
This software use 3rd party npm module [Assemblage](https://github.com/pipedrive/assemblage), created by [Andris Reinman](https://github.com/andris9)
under the MIT license.

MyWebClass uses the [fork](https://github.com/mywebclass/assemblage/) version of his module because our fork HAVE
unit tests, and Andris Reinman have not merged our pull request yet.
We will use official Assemblage package after the merging.
