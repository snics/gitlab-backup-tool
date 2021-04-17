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

async function runGetIssues(argv) {
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

  const user = await rp.get(`${baseUrl}/api/v4/user`, requestOptions);
  if (argv.verbose) {
    console.log(`Got user: ${user.name} (${user.username}) ID: ${user.id}`);
  }

  let issues = [];
  let page = 1;
  while (!_.isEmpty(issuePage = await rp.get(
        `${baseUrl}/api/v4/issues?scope=all&page=${page} `,
        requestOptions
    ))) {
      console.log(`Reading page: ${page}`)
      issues = _.concat(issues, issuePage);
      page ++;
  }
  if (argv.verbose) {
    console.log(
      `Got all issues: count=${issues.length}\n`,
      issues.map(i => `ProjectId: ${i.project_id}, Id ${i.id}`)
    );
  }

  try {
    await fs.writeJson('./src/issues/issues.json', issues);
    console.log('Saved all issues to ./src/issues/issues.json');
  } catch (err) {
    console.error(err);
  }

};

module.exports = runGetIssues;
