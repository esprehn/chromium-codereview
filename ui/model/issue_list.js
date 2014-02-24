
function IssueList()
{
    this.incoming = []; // Array<Issue>
    this.outgoing = []; // Array<Issue>
    this.unsent = []; // Array<Issue>
    this.cc = []; // Array<Issue>
    this.closed = []; // Array<Issue>
}

IssueList.parseIssueList = function(document)
{
    var FIELDS = [null, null, "id", "subject", "owner", "reviewers", "messageCount", "draftCount", "lastModified"];
    var HANDLERS = [null, null, Number, String, convertToUser, convertToUsers, Number, Number, convertRelativeDate];

    var result = new IssueList();
    var rows = document.querySelectorAll("#queues tr");
    var currentType;

    function convertRelativeDate(value) {
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
    }

    function convertToUsers(value) {
        return value.split(",").map(function(value) {
            return User.forName(value.trim());
        });
    }

    function convertToUser(value) {
        return User.forName(value);
    }

    function processHeaderRow(row) {
        var type = row.classList[1];
        currentType = result[type];
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

    return result;
};
