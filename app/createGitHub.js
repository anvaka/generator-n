var fs = require('fs');

module.exports = function () {
  if (isGitRepository()) {
    // we already have git folder initialized. Ignore this step.
    return;
  }

  var cb = this.async();
  this.prompt([{
    type: 'confirm',
    name: 'githubProject',
    message: 'Would you like to host project on GitHub?',
    default: true
  }], function (props) {
    if (!props.githubProject) {
      cb();
      return; // user opt out from github
    }
    initGithubProject(cb, this);
  }.bind(this));
}

function initGithubProject(done, ctx) {
    var githubAuthToken = ctx.settings.get('githubOAuth');
    if (!githubAuthToken) {
      ctx.prompt([{
        type: 'input',
        name: 'githubToken',
        message: 'Please create a new personal access token: https://github.com/settings/applications and paste it here' ,
      }], function (props) {
        console.log('you entered: ' + props.githubToken);
        done();
      });
    }
}

function isGitRepository() {
  try {
    var stats = fs.lstatSync('.git');
    return stats && stats.isDirectory();
  } catch (e) { /* no git folder */ }
}
