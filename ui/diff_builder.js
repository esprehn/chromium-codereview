
function DiffBuilder(diff, file, output)
{
    this.diff = diff;
    this.file = file;
    this.output = output;
    this.highlightData = null;
}

DiffBuilder.prototype.createDiff = function()
{
    var output = this.output;
    var file = this.file;
    var language = file.language;
    var self = this;
    if (this.diff.isImage) {
        var image = document.createElement("cr-diff-image");
        image.file = file;
        output.appendChild(image);
        return;
    }
    if (this.diff.from) {
        var section = document.createElement("div");
        output.appendChild(section);
        this.emitLine(section, {
            type: "header",
            beforeNumber: 0,
            afterNumber: 0,
            contextLinesStart: 0,
            contextLinesEnd: 0,
            context: false,
            text: this.diff.from,
        });
    }
    this.diff.groups.forEach(function(group) {
        var section = document.createElement("div");
        output.appendChild(section);

        group.forEach(function(line) {
            if (language != file.language && file.shouldResetEmbeddedLanguage(language, line.text)) {
                language = file.language;
                self.highlightData = null;
            }
            self.emitLine(section, line, language);
            if (language == file.language) {
                language = file.selectEmbeddedLanguage(line.text);
                if (language != file.language)
                    self.highlightData = null;
            }
        });
    });
};

DiffBuilder.prototype.emitLine = function(section, line, language)
{
    var row = document.createElement("div");
    row.className = "row " + line.type;

    row.appendChild(this.createLineNumber(line, line.beforeNumber, "remove"));
    row.appendChild(this.createLineNumber(line, line.afterNumber, "add"));
    row.appendChild(this.createText(line, language));

    var contextAction = this.createContextAction(section, line, language);
    if (contextAction)
        row.appendChild(contextAction);

    section.appendChild(row);

    var messages = this.createMessages(line);
    if (messages)
        section.appendChild(messages);
};

DiffBuilder.prototype.createContextAction = function(section, line, language)
{
    if (!line.context)
        return null;
    var self = this;
    var action = document.createElement("cr-action");
    action.textContent = "Show context";
    action.onclick = function() {
        self.file.loadContext(line.contextLinesStart, line.contextLinesEnd).then(function(lines) {
            section.innerHTML = "";
            lines.forEach(function(line) {
                self.emitLine(section, line, language);
            });
        }).catch(function(e) {
            console.log(e);
        });
    };
    return action;
};

DiffBuilder.prototype.createLineNumber = function(line, number, type)
{
    var div = document.createElement("div");
    div.className = "line-number";
    if (line.type == "both" || line.type == type)
        div.textContent = number;
    else if (line.type == "header")
        div.textContent = "@@";
    return div;
};

DiffBuilder.prototype.createText = function(line, language)
{
    var text = document.createElement("div");
    text.className = "text";
    if (!language) {
        text.textContent = line.text;
        return text;
    }
    try {
        var code = hljs.highlight(language, line.text, true, this.highlightData);
        this.highlightData = code.top;
        text.innerHTML = code.value;
    } catch (e) {
        console.log("Syntax highlighter error", e);
        text.textContent = line.text;
    }
    return text;
};

DiffBuilder.prototype.messageForLine = function(line, number, type)
{
    if (line.type == "both" || line.type == type)
        return this.file.messages[number];
    return null;
};

DiffBuilder.prototype.createMessages = function(line)
{
    var beforeMessages = this.messageForLine(line, line.beforeNumber, "remove");
    var afterMessages = this.messageForLine(line, line.afterNumber, "add");

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
