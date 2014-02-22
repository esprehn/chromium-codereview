
function IssueMessage()
{
    this.sender = null; // User
    this.recipients = []; // Array<User>
    this.text = "";
    this.disapproval = false;
    this.date = ""; // Date
    this.approval = false;
}
