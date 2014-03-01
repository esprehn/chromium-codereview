
User.parseCurrentUser(document);

var issues = new IssueList();
issues.parseDocument(document);

var issue = issues.incoming[0];
console.log(issues);

Search.findUsers("esp", 10).then(function(users) {
    console.log(users);
}).catch(function(e) {
    console.log(e.stack, e);
});

Search.findIssues({owner: "esprehn@chromium.org"}).then(function(result) {
    console.log(result);
}).catch(function(e) {
    console.log(e.stack, e);
});

var issue = new Issue(68393002);
issue.loadDetails().then(function() {
    issue.patchsets[0].loadDetails().then(function(patchset) {
        var file = patchset.files["Source/core/rendering/RenderBlockLineLayout.cpp"];
        console.log(file.getReviewUrl());
        file.loadDrafts().then(function() {
            console.log(file.drafts);
        }).catch(function(e) {
            console.log(e.stack, e);
        });
    }).catch(function(e) {
        console.log(e.stack, e);
    });
}).catch(function(e) {
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
}).catch(function(e) {
    console.log(e.stack, e);
});
