var EventEmitter = require('events').EventEmitter
 , io = require('socket.io')
 , index = require('../../index')
 , RoomEventTrigger = index.RoomEventTrigger;


// Receives RoomEvents through EventClient ( Playlist Room Service )
// Handle real time rooms ( client connected ) depending on room state ( known through RoomEvents )
// Delegates the logic/conditions to push data to triggerKlass ( default: RoomEventTrigger )
// Responsable of pushing data to the clients ( DB Access ) depending on the trigger events
 //
 // load rooms when
 //   - add room event
 //   - client init with all the rooms
 //   - when received an event in a missing room require the new room
// TODO: var that this, can be substitued by global handler 
// errors: will go to
function SocketHandler ( socketPort, auth, track_client, trigger_klass, trigger_options ) {

  this.trigger_options = trigger_options;
  this.TriggerKlass = trigger_klass || RoomEventTrigger; 
  this.track_client = track_client;  

  this.hasBeenClosed = false;

  this.triggers = {};


  //console.log( port );
	this.manager = io.listen( socketPort );

  console.log(' ***** socket listening at '+ socketPort );

  var that = this;

  this.manager
    .of('/admin')
    .on('connection', function( socket ) {

       socket.on('add_room', function() {
          var a = Array.prototype.slice.call(arguments);
          that['add_room'].apply( that, a );
       });

       socket.on('delete_room', function() {
          var a = Array.prototype.slice.call(arguments);
          that['delete_room'].apply( that, a );
       });

       socket.on('incr_action', function(items) {
          var a = Array.prototype.slice.call(arguments);
          that['incr_action'].apply( that, a );
       });

       socket.on('reset', function(items) {
          var a = Array.prototype.slice.call(arguments);
          that['reset'].apply( that, a );
       });

       socket.on('toogle', function(items) {
          var a = Array.prototype.slice.call(arguments);
          that['toogle'].apply( that, a );
       });

  });


  this.manager.configure( function (){

    this.set('authorization', function (handshakeData, callback) {
      console.log( 'auth..');
      auth( handshakeData, callback, that.triggers ); 

    });

  });

}

// for testing purpose: decouples the trigger of sending Refreshing Events
// on this case, this logic can be set up outside on SocketHandler events
SocketHandler.prototype.__proto__ = EventEmitter.prototype;


// could emit an event
SocketHandler.prototype.close = function ( ) {


  if ( !this.hasBeenClosed  ) { 	

    this.hasBeenClosed = true;

    var trigger;
    for (var room_id in this.triggers ) {

      trigger = this.triggers[room_id];
      trigger.close();

    }

		this.manager.server.close();

  }

};

// create a room, which is a requirements for the authorization process
SocketHandler.prototype.add_room = function ( room_id, tracks ) {

  console.log('add room ' + room_id + ' with ' + tracks.length + ' tracks ' );
  if ( this.triggers[room_id]  ) { 

    throw Error( 'adding room (' + room_id + ') already exists' );

  } if ( !tracks.length ) { 

    throw Error( 'adding room (' + room_id + ') has no tracks' );

  } else {


    this.manager
      .of('/'+room_id)
      .on('connection', function( socket ) {
    //    console.log( 'Socket on connection..... ' );
    });

    var trigger = new this.TriggerKlass( room_id, tracks, this.trigger_options );
    var that = this;

    trigger.on('trigger', function( id, ids ) {
        // TODO: didn't find the way to decouple that ( i want test without db and with db
        that.track_client.getTracks( trigger.id, ids, function(err, tracks) {

          if (err) throw err;
          
          //without namespaces
          //that.manager.sockets.in(id).emit('trigger', tracks );
          that.manager.of('/'+id).emit('trigger', tracks );

        });

    });

    this.triggers[room_id] = trigger;


  }

};

// disconnect all the sockets in the room
SocketHandler.prototype.delete_room = function ( room_id ) {

  console.log('delete ' + room_id );
  if ( !this.triggers[room_id] ) { 

		throw Error( 'delteing room (' + room_id + ') not exists' );

	} else  { 

    // TODO: confirm that this is the way to disconnect clients when
    // using namespaces
    this.manager.sockets.clients(room_id).forEach( function( socket ) {

      socket.disconnect();

    });

    var trigger = this.triggers[room_id];

    trigger.close();
		delete trigger; 


	}

};

// tracks events
SocketHandler.prototype.toogle = function ( room_id, track_id ) {

  console.log('toogle ' + room_id + ' track ' + track_id);

  _perform_when_room_is_present(room_id, this, function(handler){
       handler.triggers[room_id].toogle( track_id );
  });

} 

SocketHandler.prototype.incr_action = function ( room_id, track_id, action ) {

  console.log('action ' + room_id + ' track ' + track_id+ ' action ' + action);

  _perform_when_room_is_present(room_id, this, function(handler){
      handler.triggers[room_id].incr_action( track_id, action );
  });

} 

SocketHandler.prototype.reset = function ( room_id, track_id ) {

  console.log('reset ' + room_id + ' track ' + track_id);

  _perform_when_room_is_present(room_id, this, function(handler){
      handler.triggers[room_id].reset( track_id );
  });



} 

_perform_when_room_is_present = function ( room_id , handler , next ) {

  if ( handler.triggers[room_id] ) {
    next( handler );
  } else {

    handler.track_client.getAllTracks( room_id,  function(err, result){

      if(err) throw err;

      handler.add_room(room_id, result);

      next( handler );

    });

  }


} 


//TODO: should be a working process to clean db items and removing
//triggers on SocketHandler

module.exports = SocketHandler;

// TODO: can be spawned on multi process or server using REDIS
// DOUBT: sockets: leave namespace
//
// divide reponsability in different classes
//
// create fails use cases. New methods for clients will be available
// create a method that server sends push methods to clients, assuring that they are in rooms
//
      // what's up when a room is not available, should ask to the service......
      /*
      authorization(handshakeData, callback, triggers);

      var room_id = handshakeData.query.room;
      var authorized = this.triggers[room_id]!=undefined;
      var error = authorized ? undefined : 'room is not available';

      callback(error, authorized);  
      */
/*
  if ( !this.triggers[room_id] ) { 

    var that = this;
    this._request_room(room_id, function(err){
      if(err) throw err;
      
      if ( that.triggers[room_id] ) {
        that.triggers[room_id].incr_action( track_id, action );
      }
    }); 
		//throw Error( 'action in room (' + room_id + ') not exists' );

	} else {

		this.triggers[room_id].incr_action( track_id, action );

	}
*/	
