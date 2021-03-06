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

async function runPushLabels(argv) {
    const baseUrl = argv.url || 'https://gitlab.com';

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
    let groups = await rp.get(
        `${baseUrl}/api/v4/groups?per_page=999`,
        requestOptions
    );
    groups = _.map(groups, g => _.pick(g, ['id', 'path']))

    // create groupLabels
    let groupLabels;
    try {
        groupLabels = await fs.readJson('./src/labels/group_labels.json', groupLabels);
        console.log('Loaded all group labels from ./src/labels/group_labels.json');
    } catch (err) {
        console.error(err);
    }

    if (argv.verbose) {
        console.log(
            `Got all group labels: count=${groupLabels.length}\n`,
        );
    }

    groupLabels.forEach(l => {
        let groupId = groups[_.findIndex(groups, ['path', l.path])].id;
        l.id = groupId;
        let options = {
            method: 'POST',
            uri: `${baseUrl}/api/v4/groups/${groupId}/labels `,
            body: {
                l
            },
            json: true, 
            qs: {
                simple: true
            },
            headers: {
                'PRIVATE-TOKEN': argv.token
              }
        };
        rp(options)
            .then(function (parsedBody) {
                if(argv.verbose) {
                    console.log(`Created group label { id:${l.id}, name:${l.name} }`)
                }
            })
            .catch(function (err) {
                console.error(`Faild to create group label { id:${l.id}, name:${l.name} }: ${err}`)
            });
    });

    if (argv.verbose) {
        console.log(
            `Created all group labels! \n`,
        );
    }

    //get projects
    let projects = []
    for ( let group of groups ) {
        let groupProjects = await rp.get(
        `${baseUrl}/api/v4/groups/${group.id}/projects?per_page=999`,
        requestOptions
        );
        projects = _.concat(projects, groupProjects)
    }
    projects = _.map(projects, p => _.pick(p, ['id', 'path']))

    // create projectLabels
    let projectLabels;
    try {
        projectLabels = await fs.readJson('./src/labels/project_labels.json', projectLabels);
        console.log('Loaded all project labels from ./src/labels/project_labels.json');
    } catch (err) {
        console.error(err);
    }

    if (argv.verbose) {
        console.log(
            `Got all project labels: count=${projectLabels.length}\n`,
        );
    }

    projectLabels.forEach(l => {
        let projectId = projects[_.findIndex(projects, ['path', l.path])].id;
        l.id = projectId;
        let options = {
            method: 'POST',
            uri: `${baseUrl}/api/v4/projects/${l.projectId}/labels `,
            body: {
                l
            },
            json: true, 
            qs: {
                simple: true
            },
            headers: {
                'PRIVATE-TOKEN': argv.token
              }
        };
        rp(options)
            .then(function (parsedBody) {
                if(argv.verbose) {
                    console.log(`Created project label { id:${l.id}, name:${l.name} }`)
                }
            })
            .catch(function (err) {
                console.error(`Faild to create project label { id:${l.id}, name:${l.name} }: ${err}`)
            });
    });
    
    if (argv.verbose) {
        console.log(
            `Created all project labels! \n`,
        );
    }
};
module.exports = runPushLabels;
