'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');

var GeneratorSettings = require('./settings');
var settingsFileName = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.yo-n.conf');

var NGenerator = module.exports = function NGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  this.settings = new GeneratorSettings(settingsFileName);
  this.project = {};
};

util.inherits(NGenerator, yeoman.generators.Base);

NGenerator.prototype.npmInit = function () {
  // let's see if we have package.json already:
  if (require('./readPackageJson')()) {
    return;
  }

  // no package.json. Proceed to creation
  var cb = this.async();
  console.log(chalk.yellow.bold('npm init'));
  this.spawnCommand('npm', ['init'], cb)
    .on('error', cb)
    .on('exit', function (err) {
      if (err === 1) {
        this.log.error('Cancelled npm init. Terminating generator');
      } else if (err === 127) {
        this.log.error('Could not find ' + installer + '. Please install with ' +
                            '`npm install -g ' + installer + '`.');
      }
      cb(err);
    }.bind(this));
};

NGenerator.prototype.buildFilesFromPackage = require('./buildFilesFromPackageJson');

NGenerator.prototype.createGithubProject = require('./createGitHubProject');
