"use strict";

function PatchFileMessage(file)
{
    this.file = file || null;
    this.author = null; // User
    this.text = "";
    this.draft = false;
    this.line = 0;
    this.date = ""; // Date
    this.left = false;
    this.messageId = "";
}

PatchFileMessage.findDraftMessageId = function(document)
{
    if (!document)
        return "";
    var ids = document.querySelectorAll("input[name=message_id]");
    if (!ids.length)
        return "";
    return ids[ids.length - 1].value;
};

PatchFileMessage.prototype.parseData = function(data)
{
    this.author = User.forName(data.author, data.author_email);
    this.text = (data.text || "").trim();
    this.draft = data.draft || false;
    this.line = data.lineno || 0;
    this.date = Date.utc.create(data.date);
    this.left = data.left || false;
    this.messageId = data.message_id;
};
