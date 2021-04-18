#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runGetProject } = require('./src/projects');
const { runGetUsers } = require('./src/users');
const { runGetIssues } = require('./src/issues');
const { runGetLabels } = require('./src/labels');
const { runPushLabels } = require('./src/labels');

yargs(hideBin(process.argv))
  .command('backup', 'Utility to backup all gitlab repos to a local directory', (yargs) => {
    return yargs
      .option('token', {
        alias: 't',
        type: 'string',
        description: 'Gitlab Token'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Backup to output directory, defaults to ./gitlab-backup'
      })
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Enable verbose output'
      })
      .option('url', {
        alias: 'u',
        type: 'string',
        description: 'Specify Gitlab instance URL'
      })
      .option('method', {
        alias: 'm',
        type: 'string',
        description: 'Specify clone method (default is http)'
      })

      .option('backup-projects', {
        alias: 'p',
        type: 'boolean',
        description: 'Enable verbose output'
      })
      .help(true);
  }, async (argv) => {
    const { url, backupProjects } = argv;
    console.log(`Backup GitLab from ${url}:\n`);
    if (backupProjects) {
      console.log('Backup GitLab projects:\n');
      await runGetProject(argv);
    }
    await runGetIssues(argv);
  })
  .argv;
