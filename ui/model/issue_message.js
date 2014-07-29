
function IssueMessage(issue, sequence)
{
    this.issue = issue || null; // Issue
    this.author = null; // User
    this.recipients = []; // Array<User>
    this.text = "";
    this.disapproval = false;
    this.date = ""; // Date
    this.approval = false;
    this.sequence = sequence || 0;
}

IssueMessage.prototype.parseData = function(data)
{
    this.author = User.forMailingListEmail(data.sender);
    this.recipients = (data.recipients || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.recipients.sort(User.compare);
    this.text = data.text || "";
    this.disapproval = data.disapproval || false;
    this.date = Date.utc.create(data.date);
    this.approval = data.approval || false;
};
