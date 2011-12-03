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


	 var auth = function(handshakeData, callback, triggers){
			callback(null, true);
	 };

    // TODO: set in a better place
    var socketPort = process.env.PLAYLIST_SOCKET_PORT || 8080;
    socketPort = parseInt(socketPort);


    var url = process.env.PLAYLIST_ROOM_URL;
    var port = process.env.PLAYLIST_ROOM_PORT;

    var track_client = new ServiceTrackClient(url, port); 

    var handler = new SocketHandler( socketPort, auth, track_client); 
    handler.manager.set('close timeout', 2);
    handler.manager.set('client store expiration', .2);
    handler.manager.set('log level', 1);
    handler.manager.set('transports', [
       'websocket' // heroku http protocol don't support
      , 'flashsocket' // not imported flashsocket (ojo, IE)
      , 'htmlfile'
      , 'xhr-polling'
      , 'xhr-multipart'
      , 'jsonp-polling'
    ]);

    track_client.getAll( function(err, result){
      if ( err ) { 
        console.log( ' failing getting all active tracks ' );
        console.log( err );
      } else {

      var i, item; 

        console.log(result);     
        for(i = result.length;i--;) {
          item = result[i];
          //handler.add_room(item.id, item.tracks);
        }
      }

    });


}
