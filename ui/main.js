
onload = function() {
    User.parseCurrentUser(document);

    var issues = new IssueList();
    issues.parseDocument(document);

    var issue = issues.incoming[0];
    console.log(issues);

    Search.findUsers("esp", 10).then(function(users) {
        console.log(users);
    }, function(e) {
        console.log(e.stack, e);
    });

    Search.findIssues({owner: "esprehn@chromium.org"}).then(function(result) {
        console.log(result);
    }, function(e) {
        console.log(e.stack, e);
    });

    if (!issue)
        return;

    issue.loadDetails().then(function() {
        console.log(issue);
        issue.patchsets[1].loadDetails().then(function(patchset) {
            console.log(patchset);
        }, function(e) {
            console.log(e.stack, e);
        });
    }, function(e) {
        console.log(e.stack, e);
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
