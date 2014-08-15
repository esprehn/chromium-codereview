"use strict";

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

IssueList.getCachedIssues = function()
{
    var html = localStorage.getItem(IssueList.CACHE_KEY);
    if (!html)
        return null;
    var list = new IssueList();
    var doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = html;
    list.parseDocument(doc);
    return list;
};

IssueList.prototype.loadIssues = function(cache)
{
    var issues = this;
    return loadDocument(IssueList.ISSUE_LIST_URL).then(function(doc) {
        if (cache)
            localStorage.setItem(IssueList.CACHE_KEY, doc.body.innerHTML);
        issues.parseDocument(doc);
        return issues;
    });
};

IssueList.convertRelativeDate = function(value)
{
    var result = Date.create();
    var args = {};
    value.split(",").each(function(value) {
        var tokens = value.trim().split(" ");
        if (tokens.length != 2)
            return;
        var type = tokens[1];
        var amount = parseInt(tokens[0], 10);
        if (isNaN(amount) || amount <= 0)
            return;
        args[type] = amount;
    });
    return result.rewind(args);
};

IssueList.convertToUser = function(name)
{
    return User.forName(name);
}

IssueList.convertToReviewers = function(node, issue)
{
    var links = node.querySelectorAll("a");
    var users = [];

    function addUser(node) {
        if (!node)
            return;
        var user = User.forName(node.textContent.trim());
        issue.scores[user.name] = 0;
        var parentNode = node.parentNode;
        if (parentNode.className == "approval") {
            issue.scores[user.name] = 1;
            issue.approvalCount++;
        } else if (parentNode.className == "disapproval") {
            issue.scores[user.name] = -1;
            issue.disapprovalCount++;
        }
        users.push(user);
    }

    for (var i = 0; i < links.length; ++i)
        addUser(links[i]);

    var me = node.querySelectorAll("span").array().find(function(node) {
        return node.textContent == "me";
    });
    if (me)
        addUser(me.firstChild);

    return users.sort(User.compare);
};

IssueList.serializeWithInnerText = function(node)
{
    return node.innerText.trim();
};

IssueList.serializeToNode = function(node)
{
    return node;
};

IssueList.FIELDS = [
    // First two fields contain buttons and things we don't need.
    null,
    null,
    {
        name: "id",
        serializer: IssueList.serializeWithInnerText,
        converter: Number,
    },
    {
        name: "subject",
        serializer: IssueList.serializeWithInnerText,
        converter: String,
    },
    {
        name: "owner",
        serializer: IssueList.serializeWithInnerText,
        converter: IssueList.convertToUser,
    },
    {
        name: "reviwers",
        serializer: IssueList.serializeToNode,
        converter: IssueList.convertToReviewers,
    },
    {
        name: "messageCount",
        serializer: IssueList.serializeWithInnerText,
        converter: Number,
    },
    {
        name: "draftCount",
        serializer: IssueList.serializeWithInnerText,
        converter: Number,
    },
    {
        name: "lastModified",
        serializer: IssueList.serializeWithInnerText,
        converter: IssueList.convertRelativeDate,
    },
];

IssueList.prototype.parseDocument = function(document)
{
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
        var fields = {};
        for (var td = row.firstElementChild, i = 0; td; td = td.nextElementSibling, ++i) {
            var definition = IssueList.FIELDS[i];
            if (!definition)
                continue;
            fields[definition.name] = {
                definition: definition,
                node: td,
            };
        }
        if (!fields.id)
            return;
        var issue = Issue.from(fields.id.node.textContent);
        Object.keys(fields, function(key, value) {
            issue[value.definition.name] = value.definition.converter(value.definition.serializer(value.node), issue);
        });
        issue.recentActivity = row.classList.contains("updated");
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
