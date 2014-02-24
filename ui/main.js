
onload = function() {
    User.parseCurrentUser(document);

    var issues = new IssueList();
    issues.parseDocument(document);

    var issue = issues.incoming[0];
    console.log(issues);

    issue.loadDetails().then(function() {
        console.log(issue);
        issue.patchsets[0].loadDetails().then(function(patchset) {
            console.log(patchset);
        }, function(e) {
            console.log(e.stack);
        });
    }, function(e) {
        console.log(e);
    });

    // var user = issues.cc[0].reviewers[0];
    // user.loadIssues().then(function(r) {
    //     console.log(r);
    // }, function(e) {
    //     console.log(e);
    // }).catch(function(e) {
    //     console.log(e);
    // });
};
