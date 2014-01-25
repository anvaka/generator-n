/* This file constructs project tree based on information provided in package.json */
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = function () {
  var packageJson = require('./packageJson').get();
  if (!packageJson) {
    return; // How could this happen?
  }

  initPackageVariables.bind(this)(packageJson);

  copyTemplates.bind(this)(packageJson);
  createEntryPoint.bind(this)(packageJson.main);
  createLicense.bind(this)(packageJson.license);
  createUnitTests.bind(this)(packageJson);
};

function copyTemplates(packageJson) {
  this.copy('_.gitignore', '.gitignore');
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
  this.packageAuthor = packageJson.author || '';
  this.packageLicense = packageJson.license;
  this.packageDescription = packageJson.description;
}

function createLicense(license) {
  var licenseTemplate = getLicenseTemplateFromName(license);
  if (!licenseTemplate) {
    // We don't have this license template. Ignore.
    return;
  }
  this.template(path.join('license', licenseTemplate), 'LICENSE');
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
    self.log.error('Failed to install test dependencies. You will have to run command manually. Exit code: ' + err);
    done();
  }
}

function getDevDependcyFromScriptName(testScript) {
  var framework = testScript.match(/^(tap|mocha|grunt|cake)\b/);
  return framework && framework[1];
}

function getLicenseTemplateFromName(licenseName) {
  if (licenseName.match(/\bmit\b/i)) {
    return 'mit';
  } else if (licenseName.match(/\bbsd\b/i)) {
    return licenseName.indexOf('3') >= 0 ? 'bsd3' : 'bsd2';
  }
}
