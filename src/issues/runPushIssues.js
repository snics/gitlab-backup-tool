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

function Issue(issue, projects, users) {
    this.assignee_ids = _.map(issue.assignees, a => users[_.findIndex(users, ['username', a.username])].id)
    this.confidential = issue.confidential
    this.created_at	= issue.created_at
    this.description = issue.description
    this.discussion_to_resolve = null
    this.due_date = issue.due_date
    this.epic_id = null
    this.epic_iid = null
    this.id	= projects[_.findIndex(projects, ['path', issue.path])].id;
    this.iid = issue.iid 		
    this.labels	= issue.labels
    this.merge_request_to_resolve_discussions_of = null
    this.milestone_id = null	
    this.title = issue.title
    this.weight = null
}
async function runPushIssues(argv) {
    const baseUrl = argv.url || 'https://gitlab.com';
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
    console.log('Get Projects for id mapping')
    let groups = await rp.get(
        `${baseUrl}/api/v4/groups?per_page=999`,
        requestOptions
    );
    let projects = []
    for ( let group of groups ) {
        let groupProjects = await rp.get(
        `${baseUrl}/api/v4/groups/${group.id}/projects?per_page=999`,
        requestOptions
        );
        projects = _.concat(projects, groupProjects)
    }
    projects = _.map(projects, p => _.pick(p, ['id', 'path']))
    //get users
    console.log('Get Users for id mapping')
    let users = await rp.get(`${baseUrl}/api/v4/users?per_page=999`, requestOptions);
    users = _.map(users, u => _.pick(u, ['id', 'username']))

    // get issues
    let issues;
    try {
        issues = await fs.readJson('./src/issues/issues.json', issues);
        console.log('Loaded all issues labels from ./src/issues/issues.json');
    } catch (err) {
        console.error(err);
    }
    console.log(users)
    issues = _.map(issues, i => new Issue(i, projects,users));
    

    if (argv.verbose) {
        console.log(
            `Got all issues: count=${issues.length}\n`,
        );
    }

    issues.forEach(i => {
        //create issue
        let options = {
            method: 'POST',
            uri: `${baseUrl}/api/v4/projects/${l.id}/issues`,
            body: {
                i
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
                    console.log(`Created issue { id:${i.id}, iid:${i.iid} }`)
                }
            })
            .catch(function (err) {
                console.error(`Faild to create issue { id:${i.id}, iid:${i.iid} }: ${err}`)
            });
    });
};

module.exports = runPushIssues;