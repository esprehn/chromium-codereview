
function LinkTextParser(callback)
{
    this.callback = callback;
}

LinkTextParser.prototype.addText = function(text, href)
{
    if (!text)
        return;
    this.callback(text, href);
};

LinkTextParser.prototype.parse = function(text)
{
    var self = this;
    linkify(text, {
        callback: this.parseChunk.bind(this)
    });
};

LinkTextParser.prototype.parseChunk = function(text, href)
{
    if (href)
        this.addText(text, href);
    else
        this.parseBugs(text);
};

LinkTextParser.prototype.parseBugs = function(text) {
    var BUG_PATTERN = /^BUG=(\d+|,|\s)+$/m;
    var BUG_ID = /^(.*?)(\d+)(.*?)$/m;

    for (var match = text.match(BUG_PATTERN); match; match = text.match(BUG_PATTERN)) {
        var before = text.substring(0, match.index);
        this.addText(before);
        text = text.substring(match.index + match[0].length);
        var bugText = match[0];
        for (var bugMatch = bugText.match(BUG_ID); bugMatch; bugMatch = bugText.match(BUG_ID)) {
            this.addText(bugMatch[1]);
            var bugId = parseInt(bugMatch[2], 10);
            this.addText(bugId, "http://crbug.com/" + bugId);
            bugText = bugMatch[3] || "";
        }
    }

    // Add the remainder.
    this.addText(text);
};
