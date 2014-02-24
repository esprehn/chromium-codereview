
function PatchFile(patchset, name)
{
    this.name = name || "";
    this.status = "";
    this.chunks = 0;
    this.missingBaseFile = false;
    this.propertyChanges = "";
    this.added = 0;
    this.removed = 0;
    this.id = 0;
    this.patchset = patchset || null; // PatchSet
    this.isBinary = false;
    this.messages = []; // Array<PatchFileMessage>
}

PatchFile.prototype.parseData = function(data)
{
    this.status = data.status || "";
    this.chunks = data.num_chunks || 0;
    this.missingBaseFile = data.no_base_file || false;
    this.propertyChanges = data.property_changes || "";
    this.added = data.num_added || 0;
    this.removed = data.num_removed || 0;
    this.id = data.id || 0;
    this.isBinary = data.is_binary || false;

    this.messages = (data.messages || []).map(function(messageData) {
        var message = new PatchFileMessage();
        message.parseData(messageData);
        return message;
    });
};
