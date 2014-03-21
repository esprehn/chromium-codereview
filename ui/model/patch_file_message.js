
function PatchFileMessage()
{
    this.author = null; // User
    this.text = "";
    this.draft = false;
    this.line = 0;
    this.date = ""; // Date
    this.left = false;
    this.messageId = "";
}

PatchFileMessage.prototype.parseData = function(data)
{
    this.author = User.forName(data.author, data.author_email);
    this.text = data.text || "";
    this.draft = data.draft || false;
    this.line = data.lineno || 0;
    this.date = Date.utc.create(data.date);
    this.left = data.left || false;
};

PatchFileMessage.prototype.parseDraftDocument = function(document)
{
    this.author = User.current;
    this.draft = true;

    var text = document.querySelector(".comment-text");
    if (text)
        this.text = text.textContent;

    var b = document.querySelector("b");
    if (b && b.nextSibling)
        this.date = Date.create();

    var lineno = document.querySelector("input[name=lineno]");
    if (lineno)
        this.line = parseInt(lineno.value, 10);

    var messageId = document.querySelector("input[name=message_id]");
    if (lineno)
        this.messageId = messageId.value;

    var side = document.querySelector("input[name=side]");
    if (side && side.value == "a")
        this.left = true;
};
