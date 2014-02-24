
// https://codereview.chromium.org/api/148223004/?messages=true
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
    this.baseURL = "";
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
