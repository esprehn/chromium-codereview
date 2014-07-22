
function LinkTextParser(callback)
{
    this.callback = callback;
}

LinkTextParser.TRACKERS = [
    "chromium",
    "chromium-os",
    "chrome-os-partner",
    "gyp",
    "skia",
    "v8"
];

LinkTextParser.prototype.addText = function(text, href)
{
    if (!text)
        return;
    this.callback(text, href);
};

LinkTextParser.prototype.addBugText = function(text, tracker, bugId)
{
    if (tracker && !LinkTextParser.TRACKERS.find(tracker)) {
        this.addText(text)
        return;
    }
    var href = "http://code.google.com/p/{1}/issues/detail?id={2}".assign(
        encodeURIComponent(tracker || "chromium"),
        encodeURIComponent(bugId));
    this.addText(text, href);
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
    var BUG_PATTERN = /^BUG=(.+)$/m;
    var BUG_ID = /(([a-zA-Z0-9\-]*):)?(\d+)/;

    for (var match = text.match(BUG_PATTERN); match; match = text.match(BUG_PATTERN)) {
        var before = text.substring(0, match.index);
        this.addText(before);
        this.addText("BUG=");
        text = text.substring(match.index + match[0].length);
        var bugText = match[1];
        for (var bugMatch = bugText.match(BUG_ID); bugMatch; bugMatch = bugText.match(BUG_ID)) {
            var before = bugText.substring(0, bugMatch.index);
            this.addText(before);
            var tracker = bugMatch[2];
            var bugId = bugMatch[3];
            var matchText = bugMatch[0];
            this.addBugText(matchText, tracker, bugId);
            bugText = bugText.substring(bugMatch.index + bugMatch[0].length);
        }
        this.addText(bugText);
    }
    this.addText(text);
};
