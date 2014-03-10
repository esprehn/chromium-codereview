var diff = (function() {
  var kFileHeaderBegin = 'Index: ';
  var kFileHeaderEnd = '+++ ';
  var kBinaryFileHeaderEnd = 'Binary files ';
  var kPngSuffix = '.png';

  function chunkWork(work) {
    var kChunkSizeMS = 20;
    function tick() {
      var id = window.setTimeout(tick, kChunkSizeMS);
      var start = performance.now();
      while (performance.now() - start < kChunkSizeMS) {
        if (!work()) {
          window.clearTimeout(id);
          return;
        }
      }
    }
    tick();
  }

  function startsWith(string, text) {
    return string.slice(0, text.length) == text;
  }

  function endsWith(string, text) {
    if (string.length < text.length)
      return false;
    return string.slice(string.length - text.length) == text;
  }

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

  function Parser(diff, options) {
    this.lines = diff.split('\n');
    this.currentLine = 0;
    this.metadata = options.metadata;
    this.result = [];
  }

  Parser.prototype.peekLine = function() {
    return this.lines[this.currentLine];
  }

  Parser.prototype.takeLine = function() {
    return this.lines[this.currentLine++];
  }

  Parser.prototype.haveLines = function() {
    return this.currentLine != this.lines.length;
  };

  function messagesForLine(line, messages, linesWithMessages) {
    if (!linesWithMessages[line.beforeNumber] && !linesWithMessages[line.afterNumber])
      return [];

    var retval = [];
    function addMessage(message) {
      if (line.type == 'add' && message.left)
        return;
      if (line.type == 'remove' && !message.left)
        return;
      if (message.left && message.lineno != line.beforeNumber)
        return;
      if (!message.left && message.lineno != line.afterNumber)
        return;
      retval.push(message);
    }

    messages.forEach(addMessage);
    return retval;
  }

  Parser.prototype.parseFile = function(metadata) {
    var linesWithMessages = [];
    metadata.messages.forEach(function(message) {
      linesWithMessages[message.lineno] = true;
    });

    // FIXME: Remove this if-statement once the rietveld server is updated
    // to always include draft when comments=true.
    if (metadata.drafts) {
      var linesWithDrafts = [];
      metadata.drafts.forEach(function(message) {
        linesWithDrafts[message.lineno] = true;
      });
    }

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
        line.messages = messagesForLine(line, metadata.messages, linesWithMessages);

        // FIXME: Remove this if-statement once the rietveld server is updated
        // to always include draft when comments=true.
        if (metadata.drafts) {
          var drafts = messagesForLine(line, metadata.drafts, linesWithDrafts);
          drafts.forEach(function(draft) {
            if (draft.left) {
              line.hasLeftDraft = true;
              line.leftDraft =draft.text;
            } else {
              line.hasRightDraft = true;
              line.rightDraft =draft.text;
            }
          });
        }

        if (groupType == 'remove' || groupType == 'both'
)          currentBeforeLineNumber++;
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
      if (startsWith(line, kFileHeaderEnd))
        return false;
      if (startsWith(line, kBinaryFileHeaderEnd))
        return true;
    }
    throw 'Parse error: Failed to find "' + kFileHeaderEnd + ' or ' + kBinaryFileHeaderEnd + '"';
  };

  Parser.prototype.parseLine = function() {
    var line = this.takeLine();
    if (!startsWith(line, kFileHeaderBegin))
      return;
    var name = line.slice(kFileHeaderBegin.length);
    var isBinary = this.parseHeader();
    var metadata = this.metadata[name] || {
      messages: [],
      drafts: [],
    };
    this.result.push({
      name: name,
      metadata: metadata,
      isImage: isBinary && endsWith(name, kPngSuffix),
      groups: this.parseFile(metadata),
    })
  };

  Parser.prototype.parseAsync = function () {
    chunkWork(function() {
      if (!this.haveLines())
        return false;
      this.parseLine();
      return true;
    }.bind(this));
  };

  Parser.prototype.parseSync = function() {
    while (this.haveLines())
      this.parseLine();
  };

  return {
    Parser: Parser,
  }

}());
