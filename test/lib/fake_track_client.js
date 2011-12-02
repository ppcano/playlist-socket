var _ = require('underscore');

function FakeTrackClient() {
	this.items = {};
}

FakeTrackClient.prototype._addTracks = function (room_id, ids) {
    
  var redis_track
	 , tracks = [];

  ids.forEach( function(item) {
    tracks.push( item.id );
  });

	this.items[room_id] = tracks;

};


FakeTrackClient.prototype.getTracks = function (room_id, ids,  next ) {
    
   var result = _.select( this.items[room_id], function(item ) {

    //console.log( ' item id: ' + item.id + ' v: ' + _.include( ids, item.id) ); 
    return _.include( ids, item.id);

   });

   next(null, result); 

};

module.exports = FakeTrackClient;
