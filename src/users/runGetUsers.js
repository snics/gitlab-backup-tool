const argv = require('yargs')
const fs = require('fs-extra');
const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');
const cmd = require('node-cmd');
const cmdAsync = Promise.promisify(cmd.get, {
  multiArgs: true,
  context: cmd
});
const cliProgress = require('cli-progress');

async function runGetUsers(argv) {
  const baseUrl = argv.url || 'https://gitlab.com';
  if (argv.verbose) {
    console.log(`Set gitlab url to ${baseUrl}`);
  }
  console.log();
  if (!argv.token) {
    console.log(
      `Please pass your gitlab token using the --token flag,\nGet your token at ${baseUrl}/profile/personal_access_tokens\n\npass --help for full help\n\n`
    );
    process.exit(1);
  }

  const method = argv.method == 'ssh' ? 'ssh_url_to_repo' : 'http_url_to_repo';
  const requestOptions = {
    json: true,
    qs: {
      simple: true
    },
    headers: {
      'PRIVATE-TOKEN': argv.token
    }
  };

  const users = await rp.get(`${baseUrl}/api/v4/users?per_page=999`, requestOptions);

  users.forEach(logUsers);

  function logUsers(user) {
    console.log(`Got user: ${user.name} (${user.username}) ID: ${user.id}`);
  }

  async function example () {
    try {
      await fs.writeJson('./src/users/users.json', users);
      console.log('success!');
    } catch (err) {
      console.error(err);
    }
  }

  example();
}

module.exports = runGetUsers;
