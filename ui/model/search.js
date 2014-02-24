
function Search()
{
}

Search.USER_URL = "https://codereview.chromium.org/account?limit={1}&q={2}";
Search.ISSUE_URL = "https://codereview.chromium.org/search?format=json&closed={1}&owner={2}&reviewer={3}&limit={4}&cursor={5}"

Search.findUsers = function(query, limit)
{
    var url = Search.USER_URL.assign(
        encodeURIComponent(Number(limit) || 10),
        encodeURIComponent(query));

    return loadText(url).then(function(text) {
        var users = [];
        text.split("\n").each(function(line) {
            if (!line.trim())
                return;
            var user = new User();
            user.parseDetail(line);
            users.push(user);
        });
        return users;
    });
};

Search.findIssues = function(query, limit)
{
    // 0 = Unknown, 1 = Closed, 2 = Not Closed.
    var closed = 0;
    if (query.hasOwnProperty('closed'))
        closed = query.closed ? 1 : 2;

    var url = Search.ISSUE_URL.assign(
        encodeURIComponent(closed),
        encodeURIComponent(query.owner || ""),
        encodeURIComponent(query.reviewer || ""),
        encodeURIComponent(Number(limit) || 10),
        encodeURIComponent(query.cursor || ""));

    return loadJSON(url).then(function(data) {
        var issues = data.results.map(function(issueData) {
            var issue = new Issue(issueData.issue);
            issue.parseData(issueData);
            return issue;
        });
        return new SearchResult(issues, data.cursor);
    });
}