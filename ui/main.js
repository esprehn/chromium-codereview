
onload = function() {
    User.parseCurrentUser(document);
    var issues = IssueList.parseIssueList(document);
    var issue = issues.incoming[0];
    issue.loadDetails().then(function() {
        console.log(issue);
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
