
function IssueMessage(issue)
{
    this.issue = issue || null; // Issue
    this.author = null; // User
    this.recipients = []; // Array<User>
    this.text = "";
    this.disapproval = false;
    this.date = ""; // Date
    this.approval = false;
}

IssueMessage.prototype.parseData = function(data)
{
    this.author = User.forMailingListEmail(data.sender);
    this.recipients = (data.recipients || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.text = data.text || "";
    this.disapproval = data.disapproval || false;
    this.date = Date.create(data.date);
    this.approval = data.approval || false;
};
