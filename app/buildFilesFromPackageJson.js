/* This file constructs project tree based on information provided in package.json */

module.exports = function () {
  var packageJson = require('./readPackageJson')();
  if (!packageJson) {
    return; // How could this happen?
  }

  this.packageName = packageJson.name;
  this.packageLicense = packageJson.license;
  this.packageDescription = packageJson.description;

  this.copy('.gitignore', '.gitignore');
  this.template('_readme.md', 'README.md');
};
