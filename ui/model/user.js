
function User(name, email, displayName)
{
    this.name = name || "";
    this.email = email || "";
    this.openIssues = 0;
    this.reviewedIssues = 0;
    this.xsrfToken = "";
    this.displayName = displayName || name || "";
}

User.CURRENT_USER_URL = "https://codereview.chromium.org/settings";
User.DETAIL_URL = "https://codereview.chromium.org/user_popup/{1}";
User.ISSUE_LIST_URL = "https://codereview.chromium.org/user/{1}";

User.EMAIL_PATTERN = /([^@]+@[^ ]+) \(([^)]+)\)/;
User.ISSUES_OPEN_PATTERN = /issues created: (\d+)/;
User.ISSUES_REVIEW_PATTERN = /issues reviewed: (\d+)/;
User.XSRF_TOKEN_PATTERN = /xsrfToken = '([^']+)';/;

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
    var user = new User(match[2], match[1], "me");
    var script = document.body.querySelector("script");
    if (script) {
        var match = script.textContent.match(User.XSRF_TOKEN_PATTERN);
        if (match)
            user.xsrfToken = match[1];
    }
    User.current = user;
    return user;
};

User.loadCurrentUser = function(refresh)
{
    if (User.current && !refresh)
        return Promise.resolve(User.current);
    return loadDocument(User.CURRENT_USER_URL).then(function(document) {
        return User.parseCurrentUser(document);
    });
};

User.forName = function(name)
{
    if (User.current && (name === "me" || name === User.current.name))
        return User.current;
    return new User(name);
};

User.forMailingListEmail = function(email)
{
    // Lots of people use a + url for auto-cc lists, remove it since they
    // often use their normal user name just with the + part added.
    email = email.remove(/\+[^@]+/);
    if (User.current && User.current.email === email)
        return User.current;
    return new User(email.split("@")[0] || "", email);
};

User.prototype.isCurrentUser = function()
{
    return User.current && this.name === User.current.name;
};

User.prototype.getIssueListUrl = function()
{
    return User.ISSUE_LIST_URL.assign(encodeURIComponent(this.email || this.name));
};

User.prototype.getDetailUrl = function()
{
    return User.DETAIL_URL.assign(encodeURIComponent(this.email || this.name));
};

User.prototype.loadDetails = function()
{
    var user = this;
    return loadText(this.getDetailUrl()).then(function(text) {
        user.parseDetail(text);
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
