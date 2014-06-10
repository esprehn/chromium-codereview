
function DiffParser(text)
{
    this.lines = text.split("\n");
    this.currentLine = 0;
}

DiffParser.HEADER_BEGIN = "Index: ";
DiffParser.HEADER_END = "+++ ";
DiffParser.BINARY_HEADER_END = "Binary files ";
DiffParser.COPY_HEADER_END = "similarity index ";
DiffParser.PNG_SUFFIX = ".png";
DiffParser.COPY_FROM_PREFIX = "copy from ";
DiffParser.COPY_TO_PREFIX = "copy to ";
DiffParser.HEADER_PATTERN = /^@@ \-(\d+),[^+]+\+(\d+)(,\d+)? @@ ?(.*)/;

DiffParser.prototype.peekLine = function()
{
    return this.lines[this.currentLine];
};

DiffParser.prototype.takeLine = function(type)
{
    var line = this.lines[this.currentLine++];
    if (!type)
        return line;
    if (type == "add" || type == "remove" || type == "both")
        return line.slice(1);
    return line;
};

DiffParser.prototype.haveLines = function()
{
    return this.currentLine != this.lines.length;
};

DiffParser.prototype.nextLineType = function()
{
    var line = this.peekLine();
    if (!line.length)
        return "empty";
    var c = line[0];
    if (c == "@")
        return "header";
    if (c == "+")
        return "add";
    if (c == "-")
        return "remove";
    if (c == "I")
        return "index";
    if (c == " ")
        return "both";
    if (c == "\\")
        return "empty";
    throw new Error("Parse error: Unable to classify line: '{1}'".assign(line));
};

DiffParser.prototype.parseFile = function()
{
    var groups = [];
    var currentGroupType = "";
    var currentGroup = [];
    var currentBeforeLineNumber = 0;
    var currentAfterLineNumber = 0;
    var deltaOffset = 0;
    var removeCount = 0;
    while (this.haveLines()) {
        var type = this.nextLineType();
        if (type == "index" || type == "empty")
            break; // We're done with this file.

        var groupType = type;
        var line = {
            type: type,
            beforeNumber: 0,
            afterNumber: 0,
            contextLinesStart: 0,
            contextLinesEnd: 0,
            context: false,
            text: "",
        };

        if (groupType == "header") {
            var matchedHeader = this.takeLine().match(DiffParser.HEADER_PATTERN);
            var beforeLineNumber = parseInt(matchedHeader[1], 10);
            var afterLineNumber = parseInt(matchedHeader[2], 10);
            line.contextLinesStart = currentBeforeLineNumber + deltaOffset;
            line.contextLinesEnd = beforeLineNumber - 1 + deltaOffset;
            line.context = (line.contextLinesEnd - line.contextLinesStart) > 0;
            line.text = matchedHeader[4];
            currentBeforeLineNumber = beforeLineNumber;
            currentAfterLineNumber = afterLineNumber;
            if (!beforeLineNumber)
                continue;
        } else {
            line.beforeNumber = currentBeforeLineNumber;
            line.afterNumber = currentAfterLineNumber;
            line.text = this.takeLine(type);

            if (groupType == "remove" || groupType == "both")
                currentBeforeLineNumber++;
            if (groupType == "add" || groupType == "both")
                currentAfterLineNumber++;
        }

        if (groupType == "remove")
            removeCount++;
        else if (groupType == "add" && removeCount)
            removeCount--;
        else if (groupType == "add")
            deltaOffset++;
        else
            removeCount = 0;

        if (groupType == "add" || groupType == "remove")
            groupType = "delta";
        if (groupType != currentGroupType) {
            if (currentGroup.length)
                groups.push(currentGroup);
            currentGroupType = groupType;
            currentGroup = [];
        }
        currentGroup.push(line);
    }
    if (currentGroup.length)
        groups.push(currentGroup);

    // Always have a header at the end of the file to allow an "Expand context"
    // link to show the rest of the file after the last group.
    groups.push([{
        type: "header",
        beforeNumber: 0,
        afterNumber: 0,
        contextLinesStart: currentBeforeLineNumber + deltaOffset,
        contextLinesEnd: Number.MAX_SAFE_INTEGER,
        context: true,
        text: "",
    }]);
    return groups;
};

DiffParser.prototype.parseCopy = function()
{
    var result = {
        from: "",
        to: "",
    };
    while (this.haveLines()) {
        var line = this.takeLine();
        if (line.startsWith(DiffParser.COPY_FROM_PREFIX))
            result.from = line.from(DiffParser.COPY_FROM_PREFIX.length);
        else if (line.startsWith(DiffParser.COPY_TO_PREFIX))
            result.to = line.from(DiffParser.COPY_TO_PREFIX.length);
    }
    return result;
};

DiffParser.prototype.parseHeader = function()
{
    while (this.haveLines()) {
        var line = this.takeLine();
        if (line.startsWith(DiffParser.HEADER_END))
            return "text";
        if (line.startsWith(DiffParser.BINARY_HEADER_END))
            return "binary"
        if (line.startsWith(DiffParser.COPY_HEADER_END))
            return "copy";
    }
    throw new Error("Parse error: Failed to find one of '{1}', '{2}' or '{3}'".assign(
        DiffParser.HEADER_END,
        DiffParser.BINARY_HEADER_END,
        DiffParser.COPY_HEADER_END));
};

DiffParser.prototype.parse = function()
{
    var result = [];
    while (this.haveLines()) {
        var line = this.takeLine();
        if (!line.startsWith(DiffParser.HEADER_BEGIN))
            continue;
        var name = line.slice(DiffParser.HEADER_BEGIN.length);
        var type = this.parseHeader();
        var copy = (type == "copy") ? this.parseCopy() : null;
        result.push({
            name: name,
            isImage: type != "text" && name.endsWith(DiffParser.PNG_SUFFIX),
            copy: copy,
            groups: this.parseFile(),
        });
    }
    return result;
};
