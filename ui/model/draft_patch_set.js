
function DraftPatchSet(patchset)
{
    this.patchset = patchset;
    this.files = []; // Array<PatchFile>
}

DraftPatchSet.prototype.updateFiles = function()
{
    this.files = this.patchset.files.findAll(function(file) {
        return file.draftCount;
    });
};
