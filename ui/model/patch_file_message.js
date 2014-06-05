
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

PatchFileMessage.createDraft = function()
{
    var message = new PatchFileMessage();
    message.draft = true;
    message.author = User.current;
    return message;
};

PatchFileMessage.prototype.parseData = function(data)
{
    this.author = User.forName(data.author, data.author_email);
    this.text = (data.text || "").trim();
    this.draft = data.draft || false;
    this.line = data.lineno || 0;
    this.date = Date.utc.create(data.date);
    this.left = data.left || false;
};

PatchFileMessage.prototype.parseDraftElement = function(element)
{
    var b = element.querySelector("b");
    if (!b || !b.nextSibling)
        return;

    var text = element.querySelector(".comment-text");
    if (text)
        this.text = text.textContent.trim();

    var userName = b.textContent;
    if (userName == "(Draft)") {
        this.author = User.current;
        this.draft = true;
    } else {
        this.author = User.forName(userName);
    }

    var date = b.nextSibling.nodeValue;
    if (date)
        this.date = Date.create(date + " GMT");

    var lineno = element.querySelector("input[name=lineno]");
    if (lineno)
        this.line = parseInt(lineno.value, 10);

    var messageId = element.querySelector("input[name=message_id]");
    if (lineno)
        this.messageId = messageId.value;

    var side = element.querySelector("input[name=side]");
    if (side && side.value == "a")
        this.left = true;
};
