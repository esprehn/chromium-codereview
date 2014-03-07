
function IssueList()
{
    this.owner = null; // User
    this.incoming = []; // Array<Issue>
    this.outgoing = []; // Array<Issue>
    this.unsent = []; // Array<Issue>
    this.cc = []; // Array<Issue>
    this.closed = []; // Array<Issue>
}

IssueList.ISSUE_LIST_URL = "/";

IssueList.prototype.loadIssues = function()
{
    var issueList = this;
    return loadDocument(IssueList.ISSUE_LIST_URL).then(function(document) {
        issueList.parseDocument(document);
        return issueList;
    });
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
        issueList.owner = new User(name);
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
