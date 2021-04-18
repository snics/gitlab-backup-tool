async function runPushUsers() {
/*
    admin	                                No	User is admin - true or false (default)
    avatar	                                No	Image file for user’s avatar
    bio	                                    No	User’s biography
    can_create_group	                    No	User can create groups - true or false
    color_scheme_id	                        No	User’s color scheme for the file viewer (see the user preference docs for more information)
    email	                                Yes	Email
    extern_uid	                            No	External UID
    external	                            No	Flags the user as external - true or false (default)
    extra_shared_runners_minutes_limit	    No	Extra pipeline minutes quota for this user (purchased in addition to the minutes included in the plan) 
    force_random_password	                No	Set user password to a random value - true or false (default)
    group_id_for_saml	                    No	ID of group where SAML has been configured
    linkedin	                            No	LinkedIn
    location	                            No	User’s location
    name	                                Yes	Name
    note	                                No	Admin notes for this user
    organization	                        No	Organization name
    password	                            No	Password
    private_profile	                        No	User’s profile is private - true, false (default), or null (is converted to false)
    projects_limit	                        No	Number of projects user can create
    provider	                            No	External provider name
    reset_password	                        No	Send user password reset link - true or false(default)
    shared_runners_minutes_limit	        No	Pipeline minutes quota for this user (included in plan). Can be nil (default; inherit system default), 0 (unlimited) or > 0 
    skip_confirmation	                    No	Skip confirmation - true or false (default)
    skype	                                No	Skype ID
    theme_id	                            No	The GitLab theme for the user (see the user preference docs for more information)
    twitter	                                No	Twitter account
    username	                            Yes	Username
    view_diffs_file_by_file	                No	Flag indicating the user sees only one file diff per page
    website_url	                            No	Website URL
*/

    var data = JSON.parse(fs.readFileSync("./src/users/users.json"));

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
      }

};


module.exports = runPushUsers;