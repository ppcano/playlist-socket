var EventEmitter = require('events').EventEmitter
  ,  _ = require('underscore');

// implements logic for triggering events to the client
// when a condition is valid: --> fire trigger event with tracks ids
function RoomEventTrigger ( id, tracks, options ) {

  // TODO: implement max actions to include ( actions.length > 0 )
  var defaults = {
      'interval': 100
    , 'max interval': 5000
    , 'min actions': 5
  };

  this.options = options || {};
  _.defaults( this.options, defaults );

  this.id = id;
  this.tracks = tracks;

  
  this.toogles = [];
  this.resets = [];
  this.actions = [];

  this.interval = setInterval( function(trigger) {
    
    if ( trigger.resets.length > 0 || 
         trigger.toogles.length > 0 || 
          trigger.actions.length > trigger.options['min actions'] ) {
      
      trigger_event( trigger );

    } 

  }, this.options['interval'], this ); 


  this.max_interval = setInterval( function(trigger) {
    
    if ( trigger.resets.length > 0 || 
         trigger.toogles.length > 0 || 
          trigger.actions.length > 0 ) {
      
      trigger_event( trigger );

    } 

  }, this.options['max interval'], this ); 

}

RoomEventTrigger.prototype.__proto__ = EventEmitter.prototype;

RoomEventTrigger.prototype.close = function ( ) {

  if ( this.interval ) clearInterval( this.interval );
  if ( this.max_interval ) clearInterval( this.max_interval );

}

RoomEventTrigger.prototype.incr_action = function ( track_id, action ) {

  this.actions.push( {id: track_id, action: action} );

} 

RoomEventTrigger.prototype.reset = function ( track_id ) {



  this.resets.push( {id: track_id} );

//  console.log(' RESET: ' + this.resets.length );

  //this.emit('reset', this.id, track_id );
} 

RoomEventTrigger.prototype.toogle = function ( track_id ) {

  this.emit('toogle', this.id, track_id );

  this.toogles.push( {id: track_id} );

} 

RoomEventTrigger.prototype._init_counters = function ( ) {

  var tmp = {};

  this.tracks.forEach( function(item, index, array) {


        tmp[item.id] = 0;

  });

  this.counters = tmp;
  this.count = 0;

} 

var trigger_event = function ( trigger ) {
    
    var ids = [];

    trigger.toogles.forEach( function(item) {
      
      if ( !_.include(ids, item.id ) ) ids.push(item.id);

    });    

    trigger.resets.forEach(function(item) {

      if ( !_.include(ids, item.id ) ) ids.push(item.id);

    });    

    trigger.actions.forEach(function(item) {

      if ( !_.include(ids, item.id ) ) ids.push(item.id);

    });    

    trigger.toogles = [];
    trigger.resets = [];
    trigger.actions = [];

    //console.log('trigger id ( '+trigger.id+ ' ) ids: ' + ids );
    trigger.emit('trigger', trigger.id, ids );
    
}

module.exports = RoomEventTrigger;
