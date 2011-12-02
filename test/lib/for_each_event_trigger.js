var EventEmitter = require('events').EventEmitter;


// Trigger with each action
function ForEachEventTrigger ( id, tracks, options ) {

  this.id = id;
  this.tracks = tracks;
}

ForEachEventTrigger.prototype.__proto__ = EventEmitter.prototype;

ForEachEventTrigger.prototype.close = function ( ) {


}

ForEachEventTrigger.prototype.incr_action = function ( track_id, action ) {

  this._trigger( track_id );

} 

ForEachEventTrigger.prototype.reset = function ( track_id ) {

  this._trigger( track_id );

} 

ForEachEventTrigger.prototype.toogle = function ( track_id ) {

  this._trigger( track_id );

} 


ForEachEventTrigger.prototype._trigger = function ( track_id ) {

  this.emit('trigger', this.id, [track_id] );

} 

module.exports = ForEachEventTrigger;
