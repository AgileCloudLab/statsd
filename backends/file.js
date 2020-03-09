/*jshint node:true, laxcomma:true */

var util = require('util');
const fs = require('fs');
var fields = JSON.parse(fs.readFileSync('config/backends/file.json', 'utf8')).fields;

function FileBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  this.config = config.console || {};

  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

FileBackend.prototype.flush = function(timestamp, metrics) {
  var out = metrics.gauges;
  delete out["statsd.timestamp_lag"];

  //var outstring = JSON.stringify(out, null, 2) + ',';
  var outstring = JSON.stringify(out, null, 2) + '\n';
  fs.appendFileSync('logs/file.json', outstring);

  var csvstr = "";
  for (var field of fields) {
    if (out.hasOwnProperty(field)) {
      csvstr += field + "," + out[field];
    } else {
      csvstr += field + "," + 0;
    }
    csvstr += ",";
  }
  csvstr = csvstr.substring(0,csvstr.length-1);
  csvstr += '\n';
  fs.appendFileSync('logs/file.csv', csvstr);
};

FileBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'console', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new FileBackend(startupTime, config, events);
  return true;
};
