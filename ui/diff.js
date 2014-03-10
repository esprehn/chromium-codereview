var diff = (function() {
  function classifyLine(line) {
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
      return 'empty'
    throw 'Parse error: Unable to classify line: "' + line + '"';
  }

  function trimLine(type, line) {
    if (type == 'add' || type == 'remove' || type == 'both')
      return line.slice(1);
    return line;
  }

  function Parser(diff) {
    this.lines = diff.split('\n');
    this.currentLine = 0;
    this.result = [];
  }

  Parser.HEADER_BEGIN = "Index: ";
  Parser.HEADER_END = "+++ ";
  Parser.BINARY_HEADER_END = "Binary files ";
  Parser.PNG_SUFFIX = ".png";

  Parser.prototype.peekLine = function() {
    return this.lines[this.currentLine];
  }

  Parser.prototype.takeLine = function() {
    return this.lines[this.currentLine++];
  }

  Parser.prototype.haveLines = function() {
    return this.currentLine != this.lines.length;
  };

  Parser.prototype.parseFile = function() {
    var groups = [];
    var currentGroupType = null;
    var currentGroup = [];
    var currentBeforeLineNumber = 0;
    var currentAfterLineNumber = 0;
    while (this.haveLines()) {
      var type = classifyLine(this.peekLine());
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
        line.text = trimLine(type, this.takeLine());

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
  }

  Parser.prototype.parseHeader = function() {
    while (this.haveLines()) {
      var line = this.takeLine();
      if (line.startsWith(Parser.HEADER_END))
        return false;
      if (line.startsWith(Parser.BINARY_HEADER_END))
        return true;
    }
    throw 'Parse error: Failed to find "' + Parser.HEADER_END + ' or ' + Parser.BINARY_HEADER_END + '"';
  };

  Parser.prototype.parseLine = function() {
    var line = this.takeLine();
    if (!line.startsWith(Parser.HEADER_BEGIN))
      return;
    var name = line.slice(Parser.HEADER_BEGIN.length);
    var isBinary = this.parseHeader();
    this.result.push({
      name: name,
      isImage: isBinary && name.endsWith(Parser.PNG_SUFFIX),
      groups: this.parseFile(),
    })
  };

  Parser.prototype.parseSync = function() {
    while (this.haveLines())
      this.parseLine();
  };

  return {
    Parser: Parser,
  }

}());
