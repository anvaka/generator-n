var path = require('path');

module.exports = function readPackageJson() {
  try {
    return require(path.join(process.cwd(), '/package.json'));
  }
  catch (e) { /* package.json is missing. We'll have to run npm init */ }
};
