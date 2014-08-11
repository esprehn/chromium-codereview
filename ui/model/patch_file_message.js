"use strict";

function PatchFileMessage(file, id)
{
    this.file = file || null;
    this.author = null; // User
    this.text = "";
    this.draft = false;
    this.line = 0;
    this.date = ""; // Date
    this.left = false;
    this.messageId = id || "";
}

PatchFileMessage.get = function(file, id)
{
    var key = ["PatchFileMessage", id];
    var issue = file.patchset.issue;
    var object = issue.getCachedObject(key);
    if (!object) {
        object = new PatchFileMessage(file, id);
        issue.addCachedObject(key, object);
    }
    return object;
};

PatchFileMessage.createDraft = function()
{
    var message = new PatchFileMessage();
    message.draft = true;
    message.author = User.current;
    return message;
};

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
