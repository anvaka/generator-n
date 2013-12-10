module.exports = Settings;
var fs = require('fs');

function Settings(storageFileName) {
  var self = this;
  this._settings = {};
  this._storageFileName = storageFileName;

  fs.readFile(storageFileName, function (err, data) {
    if (err) return; // no settings file
    try { self._settings = JSON.parse(data); }
    catch (e) { /* Something is wrong with this file. Ignore it. */ }
  });
}

Settings.prototype.get = function(key) {
  return this._settings[key];
};

Settings.prototype.set = function(key, value) {
  this._settings[key] = value;
  fs.writeFile(this._storageFileName, JSON.stringify(this._settings), function (err) {
    if (err) throw err;
  });
};
