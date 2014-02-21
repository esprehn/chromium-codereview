
function User(name)
{
    this.name = name;
    this.email = "";
    this.openIssues = 0;
    this.reviewedIssues = 0;
}

User.prototype.getIssueListUrl = function()
{
    return "https://codereview.chromium.org/user/" + encodeURIComponent(this.name);
};

User.prototype.getDetailUrl = function()
{
    return "https://codereview.chromium.org/user_popup/" + encodeURIComponent(this.name);
};

User.prototype.loadDetail = function()
{
    var user = this;
    return loadDocument(this.getDetailUrl()).then(function(document) {
        user.parseDetail(document.documentElement.innerText);
        return user;
    });
};

User.prototype.loadIssues = function()
{
    return loadDocument(this.getIssueListUrl()).then(function(document) {
        return parseIssueList(document);
    });
};

User.prototype.parseDetail = function(text)
{
    var EMAIL_PATTERN = /([^@]+@[^ ]+) \([^)]+\)/;
    var ISSUES_OPEN_PATTERN = /issues created: (\d+)/;
    var ISSUES_REVIEW_PATTERN = /issues reviewed: (\d+)/;

    var match;

    match = EMAIL_PATTERN.exec(text);
    if (match)
        this.email = match[1];

    match = ISSUES_OPEN_PATTERN.exec(text);
    if (match)
        this.openIssues = Number(match[1]);

    match = ISSUES_REVIEW_PATTERN.exec(text);
    if (match)
        this.reviewedIssues = Number(match[1]);
};
