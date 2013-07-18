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



