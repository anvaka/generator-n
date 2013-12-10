var fs = require('fs'),
    Q = require('q');

module.exports = function () {
  if (isGitRepository()) {
    // we already have git folder initialized. Ignore this step.
    return;
  }

  var done = this.async();
  var self = this;

  this.prompt([{
    type: 'confirm',
    name: 'githubProject',
    message: 'Would you like to host project on GitHub?',
    default: true
  }], function (props) {
    if (!props.githubProject) {
      done();
      return; // user opt out from github
    }

    getToken(self)
      .then(createGitHubProject.bind(self))
      .then(updatePackageJson.bind(self))
      .then(initGit.bind(self))
      .then(commit.bind(self))
      .then(push.bind(self))
      .then(function () {
        done();
      }, function (err) {
        self.log.error(err);
        done();
      });
  });
}

function initGit(token) {
  var deferred = Q.defer();

  this.log.info('Initializing new git reposotry...');
  this.spawnCommand('git', ['init'])
   .on('error', function (err) {j
     deferred.reject(new Error('Failed to initialize git repository ' + err));
   })
   .on('exit', function (err) {
     if (err) {
       deferred.reject('git init exited with code ' + err);
       return;
     }
     deferred.resolve(token);
   });

   return deferred.promise;
}

function commit() {
  // TODO: implement me. This should commit all files
}

function push() {
  // TODO: implement me. This should push initial commit to github
}

function updatePackageJson() {
  // TODO: implement me. This should add author, repository, bugs
  // if they are missing in package.json
}

function createGitHubProject(token) {
  var deferred = Q.defer();
  var projectName = this.packageName;
  var description = this.packageDescription;

  if (!projectName) {
    throw new Error("Project name is missing. Please describe how you get into this situation here: https://github.com/anvaka/generator-n/issues");
  }

  this.log.info('Creating GitHub project "' + projectName + '"... ');

  var ghme = require('octonode').client(token).me();
  ghme.repo({
    "name": projectName,
    "description": description,
  }, function (err, response, headers) {
    if (err) {
      throw new Error('Failed to create GitHub project. GitHub responed with ' + err);
    } else {
      this.log.info('Repository created.');
      deferred.resolve();
    }
  }.bind(this));

  return deferred.promise;
}

function getToken(ctx) {
  var deferred = Q.defer();

  var githubAuthToken = ctx.settings.get('githubOAuth');
  if (githubAuthToken) {
    setTimeout(function () {
      deferred.resolve(githubAuthToken);
    });
  } else {
    ctx.prompt([{
      type: 'input',
      name: 'githubToken',
      message: 'Please create a new personal access token: https://github.com/settings/applications and paste it here' ,
    }], function (props) {
      if (!props.githubToken) {
        throw new Error('Github personal token is required to access GitHub on your behalf. If you have any concerns about their security, please refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use');
        return;
      }
      ctx.settings.set('githubOAuth', props.githubToken);
      deferred.resolve(props.githubToken);
    });
  }

  return deferred.promise;
}

function isGitRepository() {
  try {
    var stats = fs.lstatSync('.git');
    return stats && stats.isDirectory();
  } catch (e) { /* no git folder */ }
}
