
// https://codereview.chromium.org/api/148223004/?messages=true
function Issue()
{
    this.description = "";
    this.cc = []; // Array<User>
    this.reviewers = []; // Array<User>
    this.messages = []; // Array<IssueMessage>
    this.owner = null; // User
    this.private = false;
    this.baseURL = "";
    this.subject = "";
    this.created = ""; // Date
    this.patchsets = []; // Array<PatchSet>
    this.modified = ""; // Date
    this.closed = false;
    this.commit = false;
    this.issue = 0;
}
