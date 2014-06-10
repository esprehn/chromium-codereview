
function IssueList()
{
    this.owner = null; // User
    this.incoming = []; // Array<Issue>
    this.outgoing = []; // Array<Issue>
    this.unsent = []; // Array<Issue>
    this.cc = []; // Array<Issue>
    this.draft = []; // Array<Issue>
    this.closed = []; // Array<Issue>
}

IssueList.ISSUE_LIST_URL = "/";
IssueList.CACHE_KEY = "IssueList.cachedIssues";

IssueList.cachedIssues = null;

IssueList.getCachedIssues = function()
{
    if (IssueList.cachedIssues)
        return IssueList.cachedIssues;
    var html = localStorage.getItem(IssueList.CACHE_KEY);
    if (!html)
        return null;
    var list = new IssueList();
    var doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = html;
    list.parseDocument(doc);
    IssueList.cachedIssues = list;
    return list;
};

IssueList.prototype.loadIssues = function(cache)
{
    var issues = this;
    return loadDocument(IssueList.ISSUE_LIST_URL).then(function(doc) {
        if (cache) {
            localStorage.setItem(IssueList.CACHE_KEY, doc.body.innerHTML);
            IssueList.cachedIssues = issues;
        }
        issues.parseDocument(doc);
        return issues;
    });
};

IssueList.prototype.equalStructure = function(other)
{
    return User.compare(this.owner, other.owner)
        && IssueList.equalListStructure(this.incoming, other.incoming)
        && IssueList.equalListStructure(this.outgoing, other.outgoing)
        && IssueList.equalListStructure(this.unsent, other.unsent)
        && IssueList.equalListStructure(this.cc, other.cc)
        && IssueList.equalListStructure(this.draft, other.draft)
        && IssueList.equalListStructure(this.closed, other.closed);
};

// Note: Compares only the data that <cr-inbox-view> cares about.
IssueList.equalListStructure = function(a, b)
{
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; ++a) {
        if (a[i].id != b[i].id
            || a[i].subject != b[i].subject
            || a[i].displayName != b[i].displayName) {
            return false;
        }
    }
    return true;
};

IssueList.prototype.updateDates = function(other)
{
    IssueList.updateListDates(this.incoming, other.incoming);
    IssueList.updateListDates(this.outgoing, other.outgoing);
    IssueList.updateListDates(this.unsent, other.unsent);
    IssueList.updateListDates(this.cc, other.cc);
    IssueList.updateListDates(this.draft, other.draft);
    IssueList.updateListDates(this.closed, other.closed);
};

IssueList.updateListDates = function(a, b)
{
    for (var i = 0; i < a.length; ++a) {
        a[i].created = b[i].created;
        a[i].lastModified = b[i].lastModified;
    }
};

IssueList.convertRelativeDate = function(value)
{
    var result = new Date();
    value.split(",").each(function(value) {
        var tokens = value.trim().split(" ");
        if (tokens.length != 2)
            return;
        var type = tokens[1];
        var amount = parseInt(tokens[0], 10);
        if (isNaN(amount) || amount <= 0)
            return;
        var args = {};
        args[type] = amount;
        result.rewind(args);
    });
    return result;
};

IssueList.convertToUsers = function(value)
{
    return value.split(",").map(function(value) {
        return User.forName(value.trim());
    }).sort(User.compare);
};

IssueList.prototype.parseDocument = function(document)
{
    var FIELDS = [null, null, "id", "subject", "owner", "reviewers", "messageCount", "draftCount", "lastModified"];
    var HANDLERS = [null, null, Number, String, User.forName, IssueList.convertToUsers, Number, Number, IssueList.convertRelativeDate];

    var issueList = this;

    if (!document.body)
        return;

    var rows = document.querySelectorAll("#queues tr");
    var currentType;

    var h2 = document.querySelector("h2");
    if (h2) {
        var name = h2.textContent.remove("Issues for ");
        issueList.owner = User.forName(name);
    }

    function processHeaderRow(row) {
        var type = row.classList[1];
        currentType = issueList[type];
    }

    function processIssueRow(row) {
        if (!currentType)
            return;
        var issue = new Issue();
        for (var td = row.firstElementChild, i = 0; td; td = td.nextElementSibling, ++i) {
            if (!FIELDS[i])
                continue;
            issue[FIELDS[i]] = HANDLERS[i](td.innerText.trim());
        }
        currentType.push(issue);
    }

    for (var i = 0; i < rows.length; ++i) {
        var row = rows[i];
        if (row.getAttribute("name") == "issue")
            processIssueRow(row);
        else if (row.classList.contains("header"))
            processHeaderRow(row);
    }
};
