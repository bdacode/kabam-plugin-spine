var assemblage = require('assemblage');

module.exports = exports = function (MWC) {
    if (MWC.config.redis) {
        var port = MWC.config.redis.port;
        var host = MWC.config.redis.host;
    } else {
        var port = null;
        var host = null;
    }

    MWC.spine={};
    //DI of spine into MWC object
    if (MWC.config.spine && MWC.config.spine.domains && MWC.config.spine.domains instanceof Array) {
        if(MWC.config.spine.domains.length==0){
            throw new Error('Error loading config! Config.spine.domains have to be an array with at least 1 domain!')
        }

        for (var i = 0; i < MWC.config.spine.domains.length; i++) {
            if(/^[a-zA-Z0-9_]+$/.test(MWC.config.spine.domains[i])){
                MWC.spine[MWC.config.spine.domains[i]]=assemblage.createMaster(MWC.config.spine.domains[i], {'port': port, 'host': host});
            } else {
                throw new Error('Error loading config! Domain '+domains[i]+' have wrong name. It name can be ONLY composed from A-Za-z0-9 and _')
            }
        }
    } else {
        throw new Error('Error loading config! Config.spine.domains have to be an array!')
    }

    //DI of spine to nodeJS request object
    MWC.app.use(function(request,response,next){
        request.spine=MWC.spine;
        next();
    });
}