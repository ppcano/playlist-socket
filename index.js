module.exports.version = '0.0.1';

// this is not a good idea, because the classes must be in order depending on its dependencies, when importing ( in all the classes ) via INDEX
// TODO: think about importing via ./ on the same package, or using an index on each package

module.exports.RoomEventTrigger = require("./app/triggers/room_event_trigger");

module.exports.ServiceTrackClient = require("./app/clients/service_track_client");

module.exports.SocketHandler = require("./app/handlers/socket_handler");

/*
module.exports.RedisTrackClient = require("./app/clients/redis_track_client");
module.exports.RoomEventNullHandler = require("./app/handlers/room_event_null_handler");
module.exports.RoomEventEmitterHandler = require("./app/handlers/room_event_emitter_handler");
module.exports.RoomSocketHandler = require("./app/handlers/room_event_socket_handler");
*/



