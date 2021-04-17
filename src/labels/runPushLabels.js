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

async function runPushLabels() {
    const requestOptions = {
        json: true,
            qs: {
                simple: true
        },
            headers: {
                'PRIVATE-TOKEN': argv.token
        }
    };

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
        rp.post(
            `${baseUrl}/api/v4/groups/${l.groupId}/labels `,
            requestOptions
        ).then(function (body) {
            if(argv.verbose) {
                console.error(`Created group label ${l.id}`)
            }
        })
        .catch(function (err) {
            console.error(`Faild to create group label ${l.id}: ${err}`)
        });
    });

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
        rp.post(
            `${baseUrl}/api/v4/projects/${l.projectId}/labels `,
            requestOptions
        ).then(function (body) {
            if(argv.verbose) {
                console.error(`Created project label ${l.id}`)
            }
        })
        .catch(function (err) {
            console.error(`Faild to create project label ${l.id}: ${err}`)
        });
    });
};
module.exports = runPushLabels;
