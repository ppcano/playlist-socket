// describe, it, before, after, beforeEach, afterEach

var assert = require('assert')
  , should = require("should")
  , fx = require("fixtures")
  , index = require("../index")
  , SocketHandler = index.SocketHandler
  , index_test = require("./index")
	, FakeTrackClient = index_test.FakeTrackClient
	, ForEachEventTrigger = index_test.ForEachEventTrigger;

var tracks = fx.tracks.list1
	, i 
	, port = 6000 
	, track_id = tracks[0].id
	, id = 'asdfasdf'
	, id2 = 'asdfasdasdfasdf';


function create_handler(){

	 // there is no authorization tests
	 var auth = function(handshakeData, callback, room_triggers){
			callback(null, true);
	 };

   var result = new SocketHandler(port, auth, new FakeTrackClient(), ForEachEventTrigger);

   result.manager.set('close timeout', 2);
   result.manager.set('client store expiration', .2);
   result.manager.set('log level', 1);
   return result;

}

function create_admin_client(){

   var result = require("socket.io-client").connect( "http://localhost/admin", { port: port ,  'reconnect': false, 'force new connection': true});

	 return result;
}


function create_room_client(id){

   var result = require("socket.io-client").connect( "http://localhost/"+id, { port: port ,  'reconnect': false, 'force new connection': true});

	 return result;

}

 
var handler, adminClient, roomClient, roomClient2;

describe('Socket Handler using a Trigger ( for each event )', function(){

  describe('admin client interaction', function(){

		before(function(){
			 handler = create_handler(8000); 
			 adminClient = create_admin_client();
		});
		after(function(){
			 handler.close();  
		});

    it('can connect', function(done){


       adminClient.on('connect', function() {

				  //adminClient.emit('add_room', id, tracks);
				  //adminClient.emit('toogle', id, id);
          done();

       });

    });

  });


  describe('admin client and room client interactions', function(){

		// must manually disconnect roomClient, because first test
		beforeEach(function(){

			 handler = create_handler(8000); 
			 adminClient = create_admin_client();
		});
		afterEach(function(){
			 adminClient.disconnect();
			 handler.close();  // to clean rooms
		});

    it('room client is disconnected when room is deleted', function(done){

       adminClient.on('connect', function() {

				  adminClient.emit('add_room', id, tracks);

				  roomClient = create_room_client(id);


					roomClient.on('connect', function() {

						adminClient.emit('delete_room', id);

					});

					roomClient.on('disconnect', function() {

						 done();

					});

       });

    });

    it('room client received trigger when action is executed on the room', function(done){

       adminClient.on('connect', function() {

						adminClient.emit('add_room', id, tracks);

						roomClient = create_room_client(id);


						roomClient.on('connect', function() {

							adminClient.emit('toogle', id);

						});

						roomClient.on('trigger', function() {
							roomClient.disconnect();
							done();

						});


       });

    });

    it('events in different rooms are not mixed', function(done){

       adminClient.on('connect', function() {

						adminClient.emit('add_room', id, tracks);
						adminClient.emit('add_room', id2, tracks);

						roomClient = create_room_client(id);
						roomClient2 = create_room_client(id2);


						roomClient.on('connect', function() {

						});

						roomClient2.on('connect', function() {

							adminClient.emit('toogle', id);

						});

						roomClient.on('trigger', function() {
							roomClient.disconnect();
							roomClient2.disconnect();
							done();

						});


						roomClient2.on('trigger', function() {
							throw new Error('....');
						});


       });

    });



  });

});

