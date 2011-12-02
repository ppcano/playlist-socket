// TODO: perform in production, process exit to close HTTPServer and release resources
var index = require('./index')
  , SocketHandler = index.SocketHandler
  , ServiceTrackClient = index.ServiceTrackClient
  , FakeTrackClient = index.FakeTrackClient;


process.on('uncaughtException', function (err) {
  console.log('uncaught exception:--------------------------------------------- ' );
  console.log( err + err.stack);
});

// it won't be executed on test mode, because it is required from a parent module
if (!module.parent) { 

    // TODO: set in a better place
    var socketPort = 8080;  
    var track_client = new ServiceTrackClient(  ); 

    var handler = new SocketHandler( socketPort, track_client); 
    handler.manager.set('close timeout', 2);
    handler.manager.set('client store expiration', .2);
    handler.manager.set('log level', 1);
    handler.manager.set('transports', [
       'websocket' // heroku http protocol don't support
 //     , 'flashsocket' // not imported flashsocket (ojo, IE)
      , 'htmlfile'
      , 'xhr-polling'
      , 'xhr-multipart'
      , 'jsonp-polling'
    ]);


}
