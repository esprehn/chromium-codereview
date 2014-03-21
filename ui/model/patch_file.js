
function PatchFile(patchset, name)
{
    this.name = name || "";
    this.status = "";
    this.chunks = 0;
    this.missingBaseFile = false;
    this.propertyChanges = "";
    this.added = 0;
    this.removed = 0;
    this.id = 0;
    this.patchset = patchset || null; // PatchSet
    this.isBinary = false;
    this.messages = {}; // Map<line number, Array<PatchFileMessage>>
    this.messageCount = 0;
    this.draftCount = 0;
}

PatchFile.REVIEW_URL = "/{1}/diff/{2}/{3}";
PatchFile.DIFF_URL = "/download/issue{1}_{2}_{3}.diff";
PatchFile.CONTEXT_URL = "/{1}/diff_skipped_lines/{2}/{3}/{4}/{5}/a/2000";
PatchFile.COMMENT_URL = "/inline_draft";

PatchFile.findDraftInDocument = function(document, text)
{
    var comments = document.querySelectorAll(".comment-border");
    var trimmedText = text.trimRight();
    for (var i = 0; i < comments.length; ++i) {
        var message = new PatchFileMessage();
        message.parseDraftElement(comments[i]);
        if (!message.draft)
            continue;
        if (message.text.trimRight() != trimmedText)
            continue;
        return message;
    }
    return null;
};

PatchFile.prototype.parseData = function(data)
{
    this.status = data.status || "";
    this.chunks = data.num_chunks || 0;
    this.missingBaseFile = data.no_base_file || false;
    this.propertyChanges = data.property_changes || "";
    this.added = data.num_added || 0;
    this.removed = data.num_removed || 0;
    this.id = data.id || 0;
    this.isBinary = data.is_binary || false;

    var self = this;
    (data.messages || []).forEach(function(messageData) {
        var message = new PatchFileMessage();
        message.parseData(messageData);
        if (!self.messages[message.line])
            self.messages[message.line] = [];
        self.messages[message.line].push(message);
        if (message.draft)
            self.draftCount++;
        else
            self.messageCount++;
    });

    Object.each(this.messages, function(line, messages) {
        messages.sort(function(messageA, messageB) {
            return messageA.date - messageB.date;
        });
    });
};

PatchFile.prototype.getReviewUrl = function()
{
    // We don't uri encode the name since it's part of the url path.
    return PatchFile.REVIEW_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        this.name);
};

PatchFile.prototype.getDiffUrl = function()
{
    return PatchFile.DIFF_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        encodeURIComponent(this.id));
};

PatchFile.prototype.getContextUrl = function(start, end)
{
    return PatchFile.CONTEXT_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        encodeURIComponent(this.id),
        encodeURIComponent(start),
        encodeURIComponent(end));
};

PatchFile.prototype.createDraft = function(message)
{
    return this.createDraftData(message).then(function(data) {
        return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
            return true;
        });
    });
};

PatchFile.prototype.saveDraft = function(message, newText)
{
    return this.createDraftData(message, true).then(function(data) {
        data.text = newText;
        return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
            return PatchFile.findDraftInDocument(xhr.response, newText);
        });
    });
};

PatchFile.prototype.discardDraft = function(message)
{
    this.createDraftData(message, true).then(function(data) {
        data.old_text = message.text;
        data.text = "";
        data.file = "";
        return sendFormData(PatchFile.COMMENT_URL, data).then(function() {
            return true;
        });
    });
};

PatchFile.prototype.createDraftData = function(message, loadMessageId)
{
    var data = {
        snapshot: message.left ? "old" : "new",
        lineno: message.line,
        side: message.left ? "a" : "b",
        issue: this.patchset.issue.id,
        patchset: this.patchset.id,
        patch: this.id,
        text: message.text,
        message_id: message.messageId,
    };
    if (message.messageId || !loadMessageId)
        return Promise.resolve(data);
    return this.loadDraftMessageId(message).then(function(messageId) {
        data.message_id = messageId;
        return data;
    });
};

PatchFile.prototype.loadDraftMessageId = function(message)
{
    var data = {
        snapshot: message.left ? "old" : "new",
        lineno: message.line,
        side: message.left ? "a" : "b",
        issue: this.patchset.issue.id,
        patchset: this.patchset.id,
        patch: this.id,
        text: "",
    };
    return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
        var draft = PatchFile.findDraftInDocument(xhr.response, message.text);
        if (draft)
            return draft.messageId;
        return "";
    });
};

PatchFile.prototype.loadDiff = function()
{
    var file = this;
    return loadText(this.getDiffUrl()).then(function(text) {
        var parser = new DiffParser(text);
        var result = parser.parse();
        if (result[0] && result[0].name == file.name)
            return result[0];
        throw new Error("No diff available");
    });
};

PatchFile.prototype.loadContext = function(start, end)
{
    var file = this;
    return loadJSON(this.getContextUrl(start, end)).then(function(data) {
        return file.parseContext(data);
    });
};

PatchFile.prototype.parseContext = function(data)
{
    var lines = [];
    for (var i = 0; i < data.length; i += 2) {
        var text = data[i][1][1][1];
        var index = text.indexOf(" ", 4);
        lines.push({
            lineNumber: text.substring(4, index),
            text: text.from(index + 1),
        });
    }
    return lines;
};
