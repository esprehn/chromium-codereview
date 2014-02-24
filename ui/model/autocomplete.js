
function AutoComplete()
{
}

AutoComplete.USER_URL = "https://codereview.chromium.org/account?limit={1}&q={2}";

AutoComplete.findUsers = function(query, limit)
{
    if (!limit)
        limit = 10;
    return loadText(AutoComplete.USER_URL.assign(encodeURIComponent(limit), encodeURIComponent(query))).then(function(text) {
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
