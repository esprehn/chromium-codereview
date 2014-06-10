
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

PatchFile.REVIEW_URL = "/{1}/diff/{2}/{3}";
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

PatchFile.computeLanguage = function(name)
{
    if (!name)
        return "";
    if (name.endsWith(/\.(cpp|h)$/))
        return "cpp";
    if (name.endsWith(/\.(html|xhtml)$/))
        return "html";
    if (name.endsWith(".js"))
        return "javascript";
    if (name.endsWith(".css"))
        return "css";
    if (name.endsWith(/\.(xml|svg)$/))
        return "xml";
    if (name.endsWith(/\.(pl|pm|cgi)$/))
        return "perl";
    if (name.endsWith(".py"))
        return "python";
    if (name.endsWith(".rb"))
        return "ruby";
    if (name.endsWith(".mm"))
        return "objectivec";
    if (name.endsWith(".json"))
        return "json";
    // FIXME: We should create a proper language definition for idl. For now we
    // use ActionScript since they're actually quite similar.
    if (name.endsWith(".idl"))
        return "actionscript";
    return "";
};

// FIXME: This is a terrible hack to get the message that matches a saved draft,
// instead the API should give you back the messageId and have a real JSON response.
PatchFile.findDraftInDocument = function(document, text)
{
    var trimmedText = text.compact().replace(/\n/g, "");
    var comments = document.querySelectorAll(".comment-border");
    for (var i = 0; i < comments.length; ++i) {
        var message = new PatchFileMessage();
        message.parseDraftElement(comments[i]);
        if (!message.draft)
            continue;
        if (message.text.compact().replace(/\n/g, "") != trimmedText)
            continue;
        message.text = text;
        return message;
    }
    return null;
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
    return this.createDraftData(message, message.date).then(function(data) {
        data.text = newText;
        return sendFormData(PatchFile.COMMENT_URL, data).then(function(xhr) {
            return PatchFile.findDraftInDocument(xhr.response, newText);
        });
    });
};

PatchFile.prototype.discardDraft = function(message)
{
    return this.createDraftData(message, true).then(function(data) {
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
    if (!diff.external)
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
