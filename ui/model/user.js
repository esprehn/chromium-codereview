
function User(name)
{
    this.name = name;
    this.email = "";
    this.openIssues = 0;
    this.reviewedIssues = 0;
}

User.prototype.getIssueListUrl = function() {
    return "https://codereview.chromium.org/user/" + encodeURIComponent(this.name);
};

User.prototype.getDetailUrl = function() {
    return "https://codereview.chromium.org/user_popup/" + encodeURIComponent(this.name);
};

User.prototype.loadDetail = function()
{
    var user = this;
    return new Promise(function(fulfill, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("GET", user.getDetailUrl());
        xhr.send();
        xhr.onload = function() {
            user.parseDetail(xhr.responseXML.documentElement.innerText);
            fulfill(user);
        };
        xhr.onerror = function(e) {
            reject(e);
        };
    });
};

User.prototype.loadIssues = function()
{
    var user = this;
    return new Promise(function(fulfill, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("GET", user.getIssueListUrl());
        xhr.send();
        xhr.onload = function() {
            fulfill(parseIssueList(xhr.responseXML));
        };
        xhr.onerror = function(e) {
            reject(e);
        };
    });
}

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
}
