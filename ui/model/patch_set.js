
// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet(issue, id)
{
    this.files = {}; // Array<PatchFile>
    this.tryJobResults = []; // Array<tryJobResults>
    this.created = ""; // Date
    this.commentCount = 0;
    this.lastModified = ""; // Date
    this.issue = issue || null;
    this.owner = null // User
    this.message = "";
    this.id = id || 0;
}

PatchSet.prototype.getDetailUrl = function()
{
    return "https://codereview.chromium.org/api/" + this.issue.id + "/" + this.id + "/?comments=true";
};

PatchSet.prototype.loadDetails = function()
{
    var patchset = this;
    return loadJSON(this.getDetailUrl()).then(function(data) {
        patchset.parseData(data);
        return patchset;
    });
};

PatchSet.prototype.parseData = function(data)
{
    var patchset = this;

    if (!this.issue || data.issue != this.issue.id || data.patchset != this.id) {
        throw new Error("Invalid patchset loaded " + data.issue + " != " + this.issue.id
            + " or " + data.patchset + " != " + this.id);
    }

    this.owner = new User(data.owner || "");
    this.message = data.message || "";
    this.lastModified = Date.create(data.modified);
    this.commentCount = data.num_comments || 0;
    this.created = Date.create(data.created);
    this.files = {};

    var files = data.files || {};
    Object.keys(files).each(function(name) {
        var file = new PatchFile(patchset, name);
        file.parseData(files[name]);
        patchset.files[name] = file;
    });

    this.tryJobResults = (data.tryJobResults || []).map(function(resultData) {
        var result = new TryJobResult();
        result.parseData(resultData);
        return result;
    });
};
