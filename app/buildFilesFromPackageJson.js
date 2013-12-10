/* This file constructs project tree based on information provided in package.json */
var fs = require('fs');

module.exports = function () {
  var packageJson = require('./readPackageJson')();
  if (!packageJson) {
    return; // How could this happen?
  }

  initPackageVariables.bind(this)(packageJson);
  copyTemplates.bind(this)(packageJson);
  createEntryPoint.bind(this)(packageJson.main);
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
