var chalk = require('chalk');

module.exports = function () {
  // let's see if we have package.json already:
  if (require('./packageJson').get()) {
    return;
  }

  // no package.json. Proceed to creation
  var done = this.async();
  console.log(chalk.yellow.bold('npm init'));
  this.spawnCommand('npm', ['init'], done)
    .on('error', done)
    .on('exit', function (err) {
      if (err === 1) {
        this.log.error('Cancelled npm init. Terminating generator');
      } else if (err === 127) {
        this.log.error('Could not find ' + installer + '. Please install with ' +
                            '`npm install -g ' + installer + '`.');
      }
      done(err);
    }.bind(this));
};
