
// https://codereview.chromium.org/api/148223004/?messages=true
// FIXME: There's no obvious way to get the draft comments, the API doesn't have them.
function Issue()
{
    this.description = "";
    this.cc = []; // Array<User>
    this.reviewers = []; // Array<User>
    this.messages = []; // Array<IssueMessage>
    this.messageCount = 0;
    this.draftCount = 0;
    this.owner = null; // User
    this.private = false;
    this.baseUrl = "";
    this.subject = "";
    this.created = ""; // Date
    this.patchsets = []; // Array<PatchSet>
    this.lastModified = ""; // Date
    this.closed = false;
    this.commit = false;
    this.id = 0;
}

Issue.prototype.getDetailUrl = function()
{
    return "https://codereview.chromium.org/api/" + encodeURIComponent(this.id) + "?messages=true";
};

Issue.prototype.loadDetails = function()
{
    var issue = this;
    return loadJSON(this.getDetailUrl()).then(function(data) {
        issue.parseData(data);
        return issue;
    });
};

Issue.prototype.parseData = function(data)
{
    var issue = this;
    if (this.id !== data.issue)
        throw new Error("Incorrect issue loaded " + this.id + " != " + data.issue);
    this.baseUrl = data.base_url || "";
    this.closed = data.closed || false;
    this.commit = data.commit || false;
    this.created = Date.create(data.created);
    this.description = data.description || "";
    this.lastModified = Date.create(data.modified);
    this.owner = User.forName(data.owner);
    this.private = data.private;
    this.subject = data.subject || "";
    this.cc = (data.cc || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.reviewers = (data.reviewers || []).map(function(email) {
        return new User("", email);
    });
    this.patchsets = (data.patchsets || []).map(function(patchsetId) {
        return new PatchSet(issue, patchsetId);
    });
    this.messages = (data.messages || []).map(function(messageData) {
        var message = new IssueMessage();
        message.parseData(messageData);
        return message;
    });
    // Overwrite the count in case they differ (ex. new comments were added since the summary list was loaded).
    this.messageCount = this.messages.length;
};
