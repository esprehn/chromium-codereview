
function PatchFileMessage()
{
    this.author = null; // User
    this.text = "";
    this.draft = false;
    this.lineno = 3;
    this.date = ""; // Date
    this.left = false;
}

PatchFileMessage.prototype.parseData = function(data)
{
    this.author = new User(data.author || "");
    this.text = data.text || "";
    this.draft = data.draft || false;
    this.lineno = data.lineno || 0;
    this.date = Date.create(data.date);
    this.left = data.left || false;
};
