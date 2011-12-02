var index = require('../../index');

// TODO: don't like this implementation
function ServiceTrackClient() {
}

ServiceTrackClient.prototype.getTracks = function (room_id, ids,  next ) {
    next(undefined, []);
};


module.exports = ServiceTrackClient;
