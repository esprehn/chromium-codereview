
function User(name, email, isCurrentUser)
{
    this.name = name || "";
    this.email = email || "";
    this.openIssues = 0;
    this.reviewedIssues = 0;
    if (isCurrentUser || this.isCurrentUser())
        this.displayName = "me";
    else
        this.displayName = this.name;
}

User.EMAIL_PATTERN = /([^@]+@[^ ]+) \(([^)]+)\)/;
User.ISSUES_OPEN_PATTERN = /issues created: (\d+)/;
User.ISSUES_REVIEW_PATTERN = /issues reviewed: (\d+)/;

User.current = null;

User.parseCurrentUser = function(document)
{
    if (!document.body)
        return null;
    var b = document.body.querySelector("div[align=right] b");
    if (!b)
        return null;
    var match = User.EMAIL_PATTERN.exec(b.textContent);
    if (!match)
        return null;
    User.current = new User(match[2], match[1], "me");
    return User.current;
};

User.forName = function(name)
{
    if (name === "me" && User.current)
        return User.current;
    return new User(name);
};

User.forMailingListEmail = function(email)
{
    // Lots of people use a + url for auto-cc lists, remove it since they
    // often use their normal user name just with the + part added.
    email = email.remove(/\+[^@]+/);
    return new User(email.split("@")[0] || "", email);
};

User.prototype.isCurrentUser = function()
{
    return User.current && this.name === User.current.name;
};

User.prototype.getIssueListUrl = function()
{
    return "https://codereview.chromium.org/user/" + encodeURIComponent(this.email || this.name);
};

User.prototype.getDetailUrl = function()
{
    return "https://codereview.chromium.org/user_popup/" + encodeURIComponent(this.email || this.name);
};

User.prototype.loadDetails = function()
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
        var issueList = new IssueList();
        issueList.parseDocument(document);
        return issueList;
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
