
function PatchFile(patchset, name)
{
    this.name = name || "";
    this.language = PatchFile.computeLanguage(name);
    this.containsEmbeddedLanguages = PatchFile.MIXED_LANGUAGES[this.language];
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

PatchFile.DIFF_URL = "/download/issue{1}_{2}_{3}.diff";
PatchFile.CONTEXT_URL = "/{1}/diff_skipped_lines/{2}/{3}/{4}/{5}/a/2000";
PatchFile.COMMENT_URL = "/inline_draft";
PatchFile.IMAGE_URL = "/{1}/image/{2}/{3}/{4}";

PatchFile.MIXED_LANGUAGES = {
    "html": true,
    "svg": true,
    "xhtml": true,
    "xml": true,
};

PatchFile.SYNTAX_LANGUAGES = {
    "cpp": "cpp",
    "h": "cpp",
    "html": "html",
    "xhtml": "html",
    "js": "javascript",
    "css": "css",
    "xml": "xml",
    "svg": "xml",
    "pl": "perl",
    "pm": "perl",
    "cgi": "perl",
    "py": "python",
    "rb": "ruby",
    "mm": "objectivec",
    "json": "json",
    // FIXME: We should create a proper language definition for idl. For now we
    // use ActionScript since they're actually quite similar.
    "idl": "actionscript",
};

PatchFile.computeLanguage = function(name)
{
    if (!name)
        return "";
    var index = name.lastIndexOf(".");
    var extension = name.from(index + 1);
    return PatchFile.SYNTAX_LANGUAGES[extension] || "";
};

PatchFile.prototype.shouldResetEmbeddedLanguage = function(language, text)
{
    if (!this.containsEmbeddedLanguages)
        return false;
    if (language == "javascript" && text.startsWith("<\/script"))
        return true;
    if (language == "css" && text.startsWith("<\/style"))
        return true;
    return false;
};

// FIXME: This isn't perfect, you can easily confuse it with multiple script
// or style tags on the same line. It's good enough for most reviews though.
PatchFile.prototype.selectEmbeddedLanguage = function(text)
{
    if (!this.containsEmbeddedLanguages)
        return this.language;
    if (text.startsWith("<script") && !text.contains("<\/script"))
        return "javascript";
    if (text.startsWith("<style") && !text.contains("<\/style"))
        return "css";
    return this.language;
};

PatchFile.prototype.addMessage = function(message)
{
    if (!this.messages[message.line])
        this.messages[message.line] = [];
    this.messages[message.line].push(message);
    if (message.draft)
        this.draftCount++;
    else
        this.messageCount++;
};

PatchFile.prototype.removeMessage = function(message)
{
    var messages = this.messages[message.line];
    if (!messages || !messages.find(message))
        return;
    messages.remove(message);
    if (message.draft)
        this.draftCount--;
    else
        this.messageCount--;
};

PatchFile.prototype.parseData = function(data)
{
    this.status = data.status || "";
    this.chunks = data.num_chunks || 0;
    this.missingBaseFile = data.no_base_file || false;
    this.propertyChanges = data.property_changes || "";
    this.added = Math.max(0, data.num_added || 0);
    this.removed = Math.max(0, data.num_removed || 0);
    this.id = data.id || 0;
    this.isBinary = data.is_binary || false;

    var self = this;
    (data.messages || []).forEach(function(messageData) {
        var message = new PatchFileMessage();
        message.parseData(messageData);
        self.addMessage(message);
    });

    Object.each(this.messages, function(line, messages) {
        messages.sort(function(messageA, messageB) {
            return messageA.date - messageB.date;
        });
    });
};

PatchFile.prototype.getDiffUrl = function()
{
    return PatchFile.DIFF_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        encodeURIComponent(this.id));
};

PatchFile.prototype.getOldImageUrl = function()
{
    return PatchFile.IMAGE_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        encodeURIComponent(this.id),
        0);
};

PatchFile.prototype.getNewImageUrl = function()
{
    return PatchFile.IMAGE_URL.assign(
        encodeURIComponent(this.patchset.issue.id),
        encodeURIComponent(this.patchset.id),
        encodeURIComponent(this.id),
        1);
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

PatchFile.prototype.saveDraft = function(message, newText)
{
    return this.createDraftData(message).then(function(data) {
        data.text = newText;
        return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
            var id = PatchFileMessage.findDraftMessageId(xhr.response);
            if (!id)
                throw new Error("Cannot save draft");
            // This isn't really the correct date, but it's good enough to just
            // approximate that it was saved right now.
            message.date = Date.utc.create();
            message.messageId = id;
            message.text = newText;
            return true;
        });
    });
};

PatchFile.prototype.discardDraft = function(message)
{
    return this.createDraftData(message).then(function(data) {
        data.old_text = message.text;
        data.text = "";
        data.file = "";
        return sendFormData(PatchFile.COMMENT_URL, data).then(function() {
            return true;
        });
    });
};

PatchFile.prototype.createDraftData = function(message)
{
    return Promise.resolve({
        snapshot: message.left ? "old" : "new",
        lineno: message.line,
        side: message.left ? "a" : "b",
        issue: this.patchset.issue.id,
        patchset: this.patchset.id,
        patch: this.id,
        text: message.text,
        message_id: message.messageId,
    });
};

PatchFile.prototype.loadDiff = function()
{
    var file = this;
    return loadText(this.getDiffUrl()).then(function(text) {
        return file.parseDiff(text);
    });
};

PatchFile.prototype.parseDiff = function(text)
{
    var parser = new DiffParser(text);
    var result = parser.parse();
    if (!result || !result[0] || result[0].name != this.name)
        throw new Error("No diff available");
    var diff = result[0];
    if (!diff.external || diff.isImage)
        return diff;
    return this.loadContext(0, Number.MAX_SAFE_INTEGER).then(function(lines) {
        diff.groups = [lines];
        return diff;
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
        var newLine = PatchFile.parseContextLine(data[i][1][1][1]);
        var oldLine = PatchFile.parseContextLine(data[i][1][0][1]);
        // FIXME: Rietveld will respond with mysterious lines sometimes, for now
        // we harden the code to skip them instead of throwing errors.
        if (!newLine || !oldLine)
            continue;
        lines.push({
            type: "both",
            beforeNumber: oldLine.lineNumber,
            afterNumber: newLine.lineNumber,
            contextLinesStart: 0,
            contextLinesEnd: 0,
            context: false,
            text: newLine.text,
        });
    }
    return lines;
};

PatchFile.parseContextLine = function(text)
{
    if (!text)
        return null;
    var numberStart = 0;
    while (text[numberStart] == " " && numberStart < text.length)
        ++numberStart;
    var numberEnd = numberStart;
    while (text[numberEnd] != " " && numberEnd < text.length)
        ++numberEnd;
    return {
        lineNumber: parseInt(text.substring(numberStart, numberEnd), 10),
        text: text.from(numberEnd + 1),
    };
};
