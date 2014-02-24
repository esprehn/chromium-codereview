
function PatchFile()
{
    this.name = "";
    this.status = "";
    this.chunks = 0;
    this.missingBaseFile = false;
    this.propertyChanges = "";
    this.added = 0;
    this.removed = 0;
    this.id = 0;
    this.isBinary = false;
    this.messages = []; // Array<PatchFileMessage>
}

PatchFile.prototype.parseData = function(data)
{
    // FIXME: Implement me.
};
