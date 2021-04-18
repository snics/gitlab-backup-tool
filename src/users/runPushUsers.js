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

async function runPushUsers(argv) {
    console.log(`Start read users from json`);
    var data = JSON.parse(fs.readFileSync("./src/users/users.json"));
    console.log(`Finish read users from json`);

    // transform to creation user
    data = _.map(data, u => new User(u));

    // logging
    data.forEach(logUser);
    function logUser(user) {
    console.log(`Got user: ${user.name} (${user.username}) Admin: ${user.admin}`);
    }

    // create users in new gitlab
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
      method: 'POST',
      json: true,
      qs: {
        simple: true
      },
      body: {
        data
      },
      headers: {
        'PRIVATE-TOKEN': argv.token
      }
    };
     
    rp(requestOptions)
        .then(function (parsedBody) {
            console.log(`Post succeeded: ${parsedBody}`);
        })
        .catch(function (err) {
            console.log(`Post failed: ${error}`);
        });

    const response = await rp.post(`${baseUrl}/api/v4/users`, requestOptions);
    console.log(`Got response: ${response}`);
};

function User(user) {
    this.admin                                  = user.is_admin;
    this.avatar                                 = user.avatar_url;
    this.bio                                    = user.bio;
    this.can_create_group                       = user.can_create_group;
    this.color_scheme_id                        = user.color_scheme_id;
    this.email                                  = user.email;
    //this.extern_uid                             = ;
    this.external                               = user.external;
    //this.extra_shared_runners_minutes_limit     = ;
    //this.force_random_password                  = ;
    //this.group_id_for_saml                      = ;
    this.linkedin                               = user.linkedin;
    this.location                               = user.location;
    this.name                                   = user.name;
    this.note                                   = user.note;
    this.organization                           = user.organization;
    //this.password                               = ;
    this.private_profile                        = user.private_profile;
    this.projects_limit                         = user.projects_limit;
    //this.provider                               = ;
    //this.reset_password                         = ;
    //this.shared_runners_minutes_limit           = ;
    //this.skip_confirmation                      = ;
    this.skype                                  = user.skype;
    this.theme_id                               = user.theme_id;
    this.twitter                                = user.twitter;
    this.username                               = user.username;
    //this.view_diffs_file_by_file                = ;
    this.website_url                            = user.web_url;


    // Existing in Get Users (Documentation)
    // -------------------------------------
    // user.state?
    // user.created_at?
    // user.public_email
    // user.job_title
    // user.last_sign_in_a
    // user.confirmed_at
    // user.last_activity_on
    // user.current_sign_in_at
    // user.identities
    // user.can_create_project
    // user.two_factor_enabled
    // user.commit_email
    // user.current_sign_in_ip
    // user.last_sign_in_ip
    // user.sign_in_count
    // -------------------------------------
  };

module.exports = runPushUsers;