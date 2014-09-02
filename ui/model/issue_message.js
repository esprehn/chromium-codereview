"use strict";

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
    this.generated = false;
    this.preview = "";
    this.active = false;
}

IssueMessage.REPLY_HEADER = /^On \d+\/\d+\/\d+ (at )?\d+:\d+:\d+, .*? wrote:$/;
IssueMessage.FILE_HEADER = /^https:\/\/codereview.chromium.org\/\d+\/diff\/\d+\/.*$/;
IssueMessage.MAX_PREVIEW_LENGTH = 300;

IssueMessage.createMessagePreview = function(text) {
    var lines = text.split("\n");
    var i = 0;

    while (i < text.length) {
        if (lines[i] === "") {
            ++i;
        } if (IssueMessage.REPLY_HEADER.test(lines[i])) {
            ++i;
        } else if (IssueMessage.FILE_HEADER.test(lines[i])) {
            i += 5;
        } else if (lines[i] && lines[i].startsWith(">")) {
            ++i;
        } else {
            break;
        }
    }

    // If we hit the end then it's not clear what's in this reply so
    // just show it all.
    if (i >= text.length)
        return text;

    return lines
        .slice(i)
        .join("\n")
        .substr(0, IssueMessage.MAX_PREVIEW_LENGTH);
};

IssueMessage.prototype.parseData = function(data)
{
    this.author = User.forMailingListEmail(data.sender);
    this.recipients = (data.recipients || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.recipients.sort(User.compare);
    this.text = data.text || "";
    this.preview = IssueMessage.createMessagePreview(this.text);
    this.disapproval = data.disapproval || false;
    this.date = Date.utc.create(data.date);
    this.approval = data.approval || false;
    this.generated = data.auto_generated || false;
};
