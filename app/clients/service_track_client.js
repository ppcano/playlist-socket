var index = require('../../index')
  , request = require('request');


// TODO: configure request at startup( token + options )
  
function ServiceTrackClient(url, port) {

  //this.url = 'http://127.0.0.1:5000/';
  this.url = url;
  if ( this.url.slice(-1) === '/' ) this.url = this.url.slice(0, this.url.length -1);
  this.url += ':'+port;

  console.log(' ***** setup client to playlist-room at '+ this.url );
  //if ( this.url.slice(-1) === '/' ) remove last character

  if ( this.url.slice(-1) !== '/' ) this.url+='/';

};

//TODO: ws must be modified with room_id
ServiceTrackClient.prototype.getTracks = function (room_id, ids,  next ) {

  if ( !ids.length  ) throw new Error('cannot request 0 tracks ids');

  var keys ='';
  ids.forEach( function(item){
    keys+=item+',';
  });
  keys= keys.slice(0, keys.length -1 );

  var url = this.url+'tracks/'+keys;

  request.get({uri: url, json: true}, function (err, response, body) {
    next(err, body);
  });

};

ServiceTrackClient.prototype.getAllTracks = function (room_id,  next ) {

  var url = this.url+'rooms/'+room_id;

  request.get({uri: url, json: true}, function (err, response, body) {
    next(err, body);
  });

};


// [ {'id': , 'tracks':}, .. ]
ServiceTrackClient.prototype.getAll = function ( next ) {

  var url = this.url+'admin/all';

  request.get({uri: url, json: true}, function (err, response, body) {
    next(err, body);
  });


};


module.exports = ServiceTrackClient;
