"use strict";

function DiffBuilder(file, output)
{
    this.file = file;
    this.language = file.language;
    this.output = output;
    this.highlightData = null;
}

DiffBuilder.prototype.emitDiff = function(diff)
{
    if (diff.isImage) {
        var image = document.createElement("cr-diff-image");
        image.file = this.file;
        this.output.appendChild(image);
        return;
    }
    if (diff.from)
        this.emitMoveHeader(diff.from);
    var groups = diff.groups;
    for (var i = 0; i < groups.length; ++i)
        this.emitGroup(groups[i]);
};

// Moves and copies need a header at the start of the file.
DiffBuilder.prototype.emitMoveHeader = function(text)
{
    var section = document.createElement("div");
    this.output.appendChild(section);
    this.emitLine(section, {
        type: "header",
        beforeNumber: 0,
        afterNumber: 0,
        contextLinesStart: 0,
        contextLinesEnd: 0,
        context: false,
        text: text,
    });
};

DiffBuilder.prototype.emitGroup = function(group, beforeSection)
{
    var section = document.createElement("div");
    for (var i = 0; i < group.length; ++i)
        this.emitLine(section, group[i]);
    this.output.insertBefore(section, beforeSection);
};

DiffBuilder.prototype.emitLine = function(section, line)
{
    var file = this.file;

    this.resetLanguageIfNeeded(line);

    var row = document.createElement("div");
    row.className = "row " + line.type;

    row.appendChild(this.createLineNumber(line, line.beforeNumber, "remove"));
    row.appendChild(this.createLineNumber(line, line.afterNumber, "add"));
    row.appendChild(this.createText(line));

    var contextAction = this.createContextAction(section, line);
    if (contextAction)
        row.appendChild(contextAction);

    section.appendChild(row);

    var messages = this.createMessages(line);
    if (messages)
        section.appendChild(messages);

    this.selectEmbeddedLanguage(line);

    // FIXME: Editing a multi line comment can end up making an entire file
    // look like a comment. For now we reset the syntax highlighter between
    // sections to avoid this in the common case. This will break headers
    // in the middle of multi line comments, but that's very rare.
    if (line.type == "header")
        this.highlightData = null;
};

DiffBuilder.prototype.resetLanguageIfNeeded = function(line)
{
    if (this.language == this.file.language)
        return;
    if (!this.file.shouldResetEmbeddedLanguage(this.language, line.text))
        return;
    this.language = this.file.language;
    this.highlightData = null;
};

DiffBuilder.prototype.selectEmbeddedLanguage = function(line)
{
    if (this.language != this.file.language)
        return;
    this.language = this.file.selectEmbeddedLanguage(line.text);
    if (this.language != this.file.language)
        this.highlightData = null;
};

DiffBuilder.prototype.createContextAction = function(section, line)
{
    if (!line.context)
        return null;
    var action = document.createElement("cr-action");
    action.textContent = "Show context";
    action.className = "show-context";
    action.line = line;
    action.section = section;
    return action;
};

DiffBuilder.prototype.createLineNumber = function(line, number, type)
{
    var div = document.createElement("div");
    div.className = "line-number";
    if (line.type == "both" || line.type == type)
        div.setAttribute("value", number);
    else if (line.type == "header")
        div.setAttribute("value", "@@");
    return div;
};

DiffBuilder.prototype.createText = function(line)
{
    var text = document.createElement("div");
    text.className = "text";
    if (!this.language) {
        text.textContent = line.text;
        return text;
    }
    try {
        var code = hljs.highlight(this.language, line.text, true, this.highlightData);
        this.highlightData = code.top;
        text.innerHTML = code.value;
    } catch (e) {
        console.log("Syntax highlighter error", e);
        text.textContent = line.text;
    }
    return text;
};

DiffBuilder.prototype.messagesForLine = function(line, number, type)
{
    if (line.type == "both" || line.type == type)
        return this.file.messages[number];
    return null;
};

DiffBuilder.prototype.createMessages = function(line)
{
    var beforeMessages = this.messagesForLine(line, line.beforeNumber, "remove");
    var afterMessages = this.messagesForLine(line, line.afterNumber, "add");

    if (!beforeMessages && !afterMessages)
        return null;

    var messages = document.createElement("div");
    messages.className = "messages";

    if (beforeMessages) {
        beforeMessages.forEach(function(message) {
            if (!message.left)
                return;
            var fileMessage = document.createElement("cr-patch-file-message");
            fileMessage.message = message;
            messages.appendChild(fileMessage);
        });
    }

    if (afterMessages) {
        afterMessages.forEach(function(message) {
            if (message.left)
                return;
            var fileMessage = document.createElement("cr-patch-file-message");
            fileMessage.message = message;
            messages.appendChild(fileMessage);
        });
    }

    return messages;
};
