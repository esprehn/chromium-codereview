
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

PatchFile.prototype.saveDraft = function(message)
{
    var data = {
        snapshot: "new",
        lineno: message.line,
        side: message.left ? "b" : "a",
        issue: this.patchset.issue.id,
        patchset: this.patchset.id,
        patch: this.id,
        text: message.text,
    };
    if (message.messageId)
        data.mesage_id = message.messageId;
    return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
        message.parseDraftDocument(xhr.response);
        return message;
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
