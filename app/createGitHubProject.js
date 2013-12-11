var fs = require('fs'),
    chalk = require('chalk'),
    Q = require('q'),
    spawnCommand;

module.exports = function () {
  if (isGitRepository()) {
    // we already have git folder initialized. Ignore this step.
    return;
  }

  spawnCommand = this.spawnCommand;

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
      .then(commitRepository.bind(self))
      .then(function () {
        done();
      }, function (err) {
        self.log.error(err);
        done();
      });
  });
}

function commitRepository(repoName) {
  if (!repoName) {
    this.log.error('GitHub repository name is missing. Please file a bug with steps to reproduce: https://github.com/anvaka/generator-n/issues');
    return;
  }

  return runGitCommand('init')
    .then(function () { return runGitCommand('add', '.'); })
    .then(function () { return runGitCommand('commit', '-m', 'Initial commit'); })
    .then(function () { return runGitCommand('remote', 'add', 'origin', 'git@github.com:' + repoName + '.git'); })
    .then(function () { return runGitCommand('push', '-u', 'origin', 'master'); })
}

function updatePackageJson(repoName) {
  if (!repoName) {
    this.log.error('GitHub repository name is missing. Please file a bug with steps to reproduce: https://github.com/anvaka/generator-n/issues');
    return;
  }

  var packageJSON = require('./packageJson').get();
  if (packageJSON.repository && packageJSON.repository.url) {
    return repoName; // Repository information is already present;
  }

  require('./packageJson').set('repository', {
    type: 'git',
    url: 'https://github.com/' + repoName
  });

  return repoName;
}

function createGitHubProject(token) {
  var deferred = Q.defer();
  var projectName = this.packageName;
  var description = this.packageDescription;

  if (!projectName) {
    throw new Error("Project name is missing. Please describe how you get into this situation here: https://github.com/anvaka/generator-n/issues");
  }

  this.log.info('Creating GitHub project "' + projectName + '"... ');

  var self = this;

  var ghme = require('octonode').client(token).me();
  ghme.repo({
    "name": projectName,
    "description": description,
  }, function (err, body, headers) {
    // TODO: this should be more robust, in case when user revoked access toke
    // we should offer him way to restore it
    if (err) {
      // can we recover from this error?
      var unauthorized = err.statusCode === 401;
      if (unauthorized) {
        // let's remove current credentials:
        self.settings.set('githubOAuth', undefined);
        self.log.info('Could not authorize with github using your token. Have you revoked it?');
        getToken(self)
          .then(createGitHubProject.bind(self))
          .then(function (repoName) {
            deferred.resolve(repoName)
          }, function (reason) {
            deferred.reject(reason);
          });
      } else {
        throw new Error('Failed to create GitHub project. GitHub responed with ' + err);
      }
    } else {
      this.log.info('Repository ' + body.full_name + ' created.');
      deferred.resolve(body.full_name);
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

function runGitCommand() {
  var deferred = Q.defer();
  var commandArguments = Array.prototype.slice.call(arguments);

  console.log(chalk.yellow.bold('git ' + commandArguments.join(' ')));

  spawnCommand('git', commandArguments)
   .on('error', handleError)
   .on('exit', function (err) {
     if (err) { handleError(err); }
     else { deferred.resolve(); }
   });

   return deferred.promise;

   function handleError(err) {
     throw new Error('Failed to run git command: ' + err);
   }
}
