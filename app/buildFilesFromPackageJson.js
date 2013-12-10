/* This file constructs project tree based on information provided in package.json */
var fs = require('fs');
var chalk = require('chalk');

module.exports = function () {
  var packageJson = require('./packageJson').get();
  if (!packageJson) {
    return; // How could this happen?
  }

  initPackageVariables.bind(this)(packageJson);

  copyTemplates.bind(this)(packageJson);
  createEntryPoint.bind(this)(packageJson.main);
  createUnitTests.bind(this)(packageJson);
};

function copyTemplates(packageJson) {
  this.copy('.gitignore', '.gitignore');
  this.template('_readme.md', 'README.md');
}

function createEntryPoint(mainFileName) {
  if (!mainFileName) {
    this.log.error('Main package file name is missing. File will not be created');
    return;
  }

  // create file if it does not exist:
  var fd = fs.openSync(mainFileName, 'a');
  fs.closeSync(fd);
}

function initPackageVariables(packageJson) {
  this.packageName = packageJson.name;
  this.packageLicense = packageJson.license;
  this.packageDescription = packageJson.description;
}

function createUnitTests(packageJson) {
  var testCommand = packageJson.scripts && packageJson.scripts.test;
  var devTestDependency = getDevDependcyFromScriptName(testCommand);
  if (!devTestDependency) {
    // no testing framework found. Ignoring;
    return;
  }

  var installArgs = ['install', devTestDependency, '--save-dev'];
  console.log(chalk.yellow.bold('npm ' + installArgs.join(' ')));

  var done = this.async(),
      self = this;
  this.spawnCommand('npm', installArgs)
    .on('error', handleError)
    .on('exit', function (err) {
      if (err) { handleError(err); }
      else {
        done();
      }
    });

  function handleError(err) {
    self.log.error('Failed to install dependencies. Exit code: ' + err);
    done(err);
  }
}

function getDevDependcyFromScriptName(testScript) {
  var framework = testScript.match(/^(tap|mocha|grunt|cake)\b/);
  return framework && framework[1];
}
