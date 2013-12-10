var path = require('path'),
    fs = require('fs'),
    pathToPackageJson = path.join(process.cwd(), '/package.json');

module.exports = {
  get: readPackageJson,
  set: function (key, value) {
    var packageJson = readPackageJson();
    if (!packageJson) { return; } // this is not normal

    // TODO: should we verify if field is present?
    packageJson[key] = value;
    writePackageJson(packageJson);
  }
};


function readPackageJson() {
  try {
    // TODO: this is not accurate. It will be cached upon first read, but file
    // could be modified afterwards.
    return require(pathToPackageJson);
  }
  catch (e) { /* package.json is missing. We'll have to run npm init */ }
}

function writePackageJson(packageJson) {
  fs.writeFileSync(pathToPackageJson, JSON.stringify(packageJson, null, 2));
}
