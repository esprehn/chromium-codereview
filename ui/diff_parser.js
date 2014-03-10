
function DiffParser(diff) {
    this.lines = diff.split('\n');
    this.currentLine = 0;
}

DiffParser.HEADER_BEGIN = "Index: ";
DiffParser.HEADER_END = "+++ ";
DiffParser.BINARY_HEADER_END = "Binary files ";
DiffParser.PNG_SUFFIX = ".png";

DiffParser.prototype.peekLine = function()
{
    return this.lines[this.currentLine];
};

DiffParser.prototype.takeLine = function(type)
{
    var line = this.lines[this.currentLine++];
    if (type == 'add' || type == 'remove' || type == 'both')
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
        return 'empty';
    var c = line[0];
    if (c == '@')
        return 'header';
    if (c == '+')
        return 'add';
    if (c == '-')
        return 'remove';
    if (c == 'I')
        return 'index';
    if (c == ' ')
        return 'both';
    if (c == '\\')
        return 'empty';
    throw 'Parse error: Unable to classify line: "' + line + '"';
};

DiffParser.prototype.parseFile = function()
{
    var groups = [];
    var currentGroupType = null;
    var currentGroup = [];
    var currentBeforeLineNumber = 0;
    var currentAfterLineNumber = 0;
    while (this.haveLines()) {
        var type = this.nextLineType();
        if (type == 'index' || type == 'empty')
            break; // We're done with this file.

        var groupType = type;
        var line = {
            type: type
        };
        var lineText;
        if (groupType == 'header') {
            var matchedHeader = this.takeLine().match(/^@@\ \-(\d+),[^+]+\+(\d+)\,\d+\ @@\ ?(.*)/);
            currentBeforeLineNumber = matchedHeader[1];
            currentAfterLineNumber = matchedHeader[2];
            line.beforeNumber = "@@";
            line.afterNumber = "@@";
            line.text = matchedHeader[3];
        } else {
            line.beforeNumber = currentBeforeLineNumber;
            line.afterNumber = currentAfterLineNumber;
            line.text = this.takeLine(type);

            if (groupType == 'remove' || groupType == 'both')
                currentBeforeLineNumber++;
            if (groupType == 'add' || groupType == 'both')
                currentAfterLineNumber++;
        }

        if (groupType == 'add' || groupType == 'remove')
            groupType = 'delta';
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
    return groups;
};

DiffParser.prototype.parseHeader = function()
{
    while (this.haveLines()) {
        var line = this.takeLine();
        if (line.startsWith(DiffParser.HEADER_END))
            return false;
        if (line.startsWith(DiffParser.BINARY_HEADER_END))
            return true;
    }
    throw 'Parse error: Failed to find "' + DiffParser.HEADER_END + ' or ' + DiffParser.BINARY_HEADER_END + '"';
};

DiffParser.prototype.parse = function()
{
    var result = [];
    while (this.haveLines()) {
      var line = this.takeLine();
      if (!line.startsWith(DiffParser.HEADER_BEGIN))
          continue;
      var name = line.slice(DiffParser.HEADER_BEGIN.length);
      var isBinary = this.parseHeader();
      result.push({
          name: name,
          isImage: isBinary && name.endsWith(DiffParser.PNG_SUFFIX),
          groups: this.parseFile(),
      });
    }
    return result;
};
