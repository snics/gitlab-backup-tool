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

  //get projects
  let groups = await rp.get(
    `${baseUrl}/api/v4/groups?per_page=999`,
    requestOptions
  );
  groups = _.map(groups, g => _.pick(g, ['id', 'path']))
  let projects = []
  for ( let group of groups ) {
      let groupProjects = await rp.get(
      `${baseUrl}/api/v4/groups/${group.id}/projects?per_page=999`,
      requestOptions
      );
      projects = _.concat(projects, groupProjects)
  }
  projects = _.map(projects, p => _.pick(p, ['id', 'path']))
  if (argv.verbose) {
    console.log(
      `Got projects:\n `, projects
    );
  }

  //get issues
  let issues = [];
  let page = 1;
  while (!_.isEmpty(issuePage = await rp.get(
        `${baseUrl}/api/v4/issues?scope=all&page=${page} `,
        requestOptions
    ))) {
      console.log(`Reading page: ${page}`)
      issuePage.forEach(i => {
        try {
          i.path = projects[_.findIndex(projects, ['id', i.project_id])].path;
          issues.push(i)
        } catch (error) {
          console.log(`Unable to find project path for id ${i.project_id}. Droping issue with id ${i.id}`) 
        }
      });
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
