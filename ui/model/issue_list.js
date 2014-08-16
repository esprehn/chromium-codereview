"use strict";

function IssueList(options)
{
    this.owner = null; // User
    this.incoming = []; // Array<Issue>
    this.outgoing = []; // Array<Issue>
    this.unsent = []; // Array<Issue>
    this.cc = []; // Array<Issue>
    this.draft = []; // Array<Issue>
    this.closed = []; // Array<Issue>
    this.issues = {};
    this.cached = options && options.cached;
    this.recentActivity = options && options.recentActivity;
}

IssueList.ISSUE_LIST_URL = "/";
IssueList.CACHE_KEY = "IssueList.cachedIssues";

IssueList.prototype.getIssue = function(id)
{
    if (!this.issues[id])
        this.issues[id] = new Issue(id);
    return this.issues[id];
};

IssueList.prototype.loadIssues = function()
{
    var self = this;
    if (this.cached) {
        var html = localStorage.getItem(IssueList.CACHE_KEY);
        if (html) {
            var doc = document.implementation.createHTMLDocument();
            doc.body.innerHTML = html;
            this.parseDocument(doc);
        }
    }
    return loadDocument(IssueList.ISSUE_LIST_URL).then(function(doc) {
        if (self.cached)
            localStorage.setItem(IssueList.CACHE_KEY, doc.body.innerHTML);
        self.parseDocument(doc);
        return self;
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

    issue.approvalCount = 0;
    issue.disapprovalCount = 0;
    issue.scores = {};

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

IssueList.prototype.parseDocument = function(document)
{
    var FIELDS = [null, null, "id", "subject", "owner", "reviewers", "messageCount", "draftCount", "lastModified"];
    var SERIALIZERS = [null, null, null, null, null, IssueList.serializeToNode, null, null, null];
    var HANDLERS = [null, null, Number, String, IssueList.convertToUser, IssueList.convertToReviewers, Number, Number, IssueList.convertRelativeDate];

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
        var issue = null;
        for (var td = row.firstElementChild, i = 0; td; td = td.nextElementSibling, ++i) {
            if (!FIELDS[i])
                continue;
            if (FIELDS[i] == "id")
                issue = issueList.getIssue(Number(td.textContent));
            var serializer = SERIALIZERS[i] || IssueList.serializeWithInnerText;
            issue[FIELDS[i]] = HANDLERS[i](serializer(td), issue);
        }
        issue.recentActivity = issueList.recentActivity && row.classList.contains("updated");
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
