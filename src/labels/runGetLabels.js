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

async function runGetLabels(argv) {
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

  const requestOptions = {
    json: true,
    qs: {
      simple: true
    },
    headers: {
      'PRIVATE-TOKEN': argv.token
    }
  };

  //get groupIds
  const groups = await rp.get(
    `${baseUrl}/api/v4/groups?per_page=999`,
    requestOptions
  );
  const gids = _.map(groups, 'id');

  //get groupLabels
  let groupLabels = [];
  
  await Promise.each(gids, async (g) => {
    if (argv.verbose) {
      console.log(`Get labels for groupId: ${g}`)
    }
    let labels = await rp.get(
      `${baseUrl}/api/v4/groups/${g}/labels `,
      requestOptions
    )
    labels.forEach(l => {
      l.groupId = g;
    });

    groupLabels = _.concat(groupLabels, labels)
    if (argv.verbose) {
      console.log(`Got ${labels.length} labels`)
    }
  });

  if (argv.verbose) {
    console.log(
      `Got all group labels: count=${groupLabels.length}\n`,
      groupLabels.map(l => `Label : ${l.name}`)
    );
  }

  try {
    await fs.writeJson('./src/labels/group_labels.json', groupLabels);
    console.log('Saved all group labels to ./src/labels/group_labels.json');
  } catch (err) {
    console.error(err);
  }

  //get projects
  let projects = []
  for ( let gid of gids ) {
    let groupProjects = await rp.get(
      `${baseUrl}/api/v4/groups/${gid}/projects?per_page=999`,
      requestOptions
    );
    projects = _.concat(projects, groupProjects)
  }

  //get projectLabels
  let projectLabels = [];
  
  await Promise.each(projects, async (p) => {
    if (argv.verbose) {
      console.log(`Get labels for projectId: ${p.id}`)
    }
    let labels = await rp.get(
      `${baseUrl}/api/v4/projects/${p.id}/labels `,
      requestOptions
    )
    labels.forEach(l => {
      l.projectId = p.id;
    });

    projectLabels = _.concat(projectLabels, labels)
    if (argv.verbose) {
      console.log(`Got ${labels.length} labels`)
    }
  });

  if (argv.verbose) {
    console.log(
      `Got all project labels: count=${projectLabels.length}\n`,
      projectLabels.map(l => `Label : ${l.name}`)
    );
  }

  try {
    await fs.writeJson('./src/labels/project_labels.json', projectLabels);
    console.log('Saved all project labels to ./src/labels/project_labels.json');
  } catch (err) {
    console.error(err);
  }
};

module.exports = runGetLabels;
