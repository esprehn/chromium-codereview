

function parseIssueList(document)
{
    var FIELDS = [null, null, "id", "subject", "owner", "reviewers", "comments", "drafts", "lastUpdated"];
    var HANDLERS = [null, null, Number, String, String, convertToUsers, Number, Number, String];

    var result = {};
    var rows = document.querySelectorAll("#queues tr");
    var currentType;

    function convertToUsers(value) {
        return value.split(",").map(function(value) {
            return new User(value.trim());
        });
    }

    function processHeaderRow(row) {
        var type = row.classList[1];
        result[type] = result[type] || [];
        currentType = result[type];
    }

    function processIssueRow(row) {
        if (!currentType)
            return;
        var issue = {};
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
}
