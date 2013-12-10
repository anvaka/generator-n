'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var NGenerator = module.exports = function NGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  var GeneratorSettings = require('./settings');
  var settingsFileName = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.yo-n.conf');
  this.settings = new GeneratorSettings(settingsFileName);
};

util.inherits(NGenerator, yeoman.generators.Base);

NGenerator.prototype.npmInit = require('./npmInit.js');

NGenerator.prototype.buildFilesFromPackage = require('./buildFilesFromPackageJson');

NGenerator.prototype.createGithubProject = require('./createGitHubProject');
