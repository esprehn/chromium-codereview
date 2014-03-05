
function PatchFileMessage()
{
    this.author = null; // User
    this.text = "";
    this.draft = false;
    this.line = 0;
    this.date = ""; // Date
    this.left = false;
}

PatchFileMessage.prototype.parseData = function(data)
{
    this.author = new User(data.author);
    this.text = data.text || "";
    this.draft = data.draft || false;
    this.line = data.lineno || 0;
    this.date = Date.utc.create(data.date);
    this.left = data.left || false;
};
