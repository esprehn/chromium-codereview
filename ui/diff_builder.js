
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
    var self = this;
    var file = this.file;

    var row = document.createElement("div");
    row.className = "row " + line.type;
    section.appendChild(row);

    var beforeMessages;
    var before = row.appendChild(document.createElement("div"));
    before.className = "line-number";
    if (line.type == "both" || line.type == "remove") {
        beforeMessages = file.messages[line.beforeNumber];
        before.textContent = line.beforeNumber;
    } else if (line.type == "header") {
        before.textContent = "@@";
    }
    row.appendChild(before);

    var afterMessages;
    var after = row.appendChild(document.createElement("div"));
    after.className = "line-number";
    if (line.type == "both" || line.type == "add") {
        afterMessages = file.messages[line.afterNumber];
        after.textContent = line.afterNumber;
    } else if (line.type == "header") {
        after.textContent = "@@";
    }
    row.appendChild(after);

    var text = row.appendChild(document.createElement("div"));
    text.className = "text";
    if (language) {
        try {
            var code = hljs.highlight(language, line.text, true, self.highlightData);
            self.highlightData = code.top;
            text.innerHTML = code.value;
        } catch (e) {
            console.log("Syntax highlighter error", e);
            text.textContent = line.text;
        }
    } else {
        text.textContent = line.text;
    }
    row.appendChild(text);

    if (line.context) {
        var action = row.appendChild(document.createElement("cr-action"));
        action.textContent = "Show context";
        action.onclick = function() {
            file.loadContext(line.contextLinesStart, line.contextLinesEnd).then(function(lines) {
                section.innerHTML = "";
                lines.forEach(function(line) {
                    self.emitLine(section, line, language);
                });
            }).catch(function(e) {
                console.log(e);
            });
        };
    }

    if (!beforeMessages && !afterMessages)
        return;

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

    if (messages.firstChild)
        section.appendChild(messages);
};
