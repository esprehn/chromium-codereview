
onload = function() {
    var issues = parseIssueList(document);
    console.log(issues);
    var user = issues.cc[0].reviewers[0];
    user.loadIssues().then(function(r) {
        console.log(r);
    }, function(e) {
        console.log(e);
    }).catch(function(e) {
        console.log(e);
    });
};
