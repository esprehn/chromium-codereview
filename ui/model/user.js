
function User(name, email)
{
    this.name = name || "";
    this.email = email || "";
    this.openIssues = 0;
    this.reviewedIssues = 0;
}

User.EMAIL_PATTERN = /([^@]+@[^ ]+) \(([^)]+)\)/;
User.ISSUES_OPEN_PATTERN = /issues created: (\d+)/;
User.ISSUES_REVIEW_PATTERN = /issues reviewed: (\d+)/;

User.current = null;

User.parseCurrentUser = function(document)
{
    var b = document.body.querySelector("div[align=right] b");
    if (!b)
        return null;
    var match = User.EMAIL_PATTERN.exec(b.textContent);
    if (!match)
        return null;
    User.current = new User(match[2], match[1]);
    return User.current;
};

User.forName = function(name)
{
    if (name === "me" && User.current)
        return User.current;
    return new User(name);
};

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
    var EMAIL_PATTERN = /([^@]+@[^ ]+) \(([^)]+)\)/;
    var ISSUES_OPEN_PATTERN = /issues created: (\d+)/;
    var ISSUES_REVIEW_PATTERN = /issues reviewed: (\d+)/;

    var match;

    match = User.EMAIL_PATTERN.exec(text);
    if (match) {
        this.email = match[1];
        this.name = match[2];
    }

    match = User.ISSUES_OPEN_PATTERN.exec(text);
    if (match)
        this.openIssues = Number(match[1]);

    match = User.ISSUES_REVIEW_PATTERN.exec(text);
    if (match)
        this.reviewedIssues = Number(match[1]);
};
