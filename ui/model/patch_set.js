
// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet(issue, id)
{
    this.files = []; // Array<PatchFile>
    this.tryJobResults = []; // Array<tryJobResults>
    this.created = ""; // Date
    this.commentCount = 0;
    this.lastModified = ""; // Date
    this.issue = issue || null;
    this.owner = null // User
    this.message = "";
    this.id = id || 0;
}

PatchSet.DETAIL_URL = "/api/{1}/{2}/?comments=true"
PatchSet.REVERT_URL = "/api/{1}/{2}/revert";

PatchSet.prototype.getDetailUrl = function()
{
    return PatchSet.DETAIL_URL.assign(
        encodeURIComponent(this.issue.id),
        encodeURIComponent(this.id));
};

PatchSet.prototype.getRevertUrl = function()
{
    return PatchSet.REVERT_URL.assign(
        encodeURIComponent(this.issue.id),
        encodeURIComponent(this.id));
};

PatchSet.prototype.loadDetails = function()
{
    var patchset = this;
    return loadJSON(this.getDetailUrl()).then(function(data) {
        patchset.parseData(data);
        return patchset;
    });
};

PatchSet.prototype.revert = function(options)
{
    if (!options.reason)
        return Promise.reject(new Error("Must supply a reason"));
    var patchset = options;
    this.createRevertData(options).then(function(data) {
        return sendFormData(patchset.getRevertUrl(), data);
    });
};

PatchSet.prototype.createRevertData = function(options)
{
    return User.loadCurrentUser(true).then(function(user) {
        return {
            xsrf_token: user.xsrfToken,
            revert_reason: options.reason,
            revert_cq: options.cq ? "1" : "0",
        };
    });
};

PatchSet.prototype.parseData = function(data)
{
    var patchset = this;

    if (!this.issue || data.issue != this.issue.id || data.patchset != this.id) {
        throw new Error("Invalid patchset loaded " + data.issue + " != " + this.issue.id
            + " or " + data.patchset + " != " + this.id);
    }

    this.owner = new User(data.owner);
    this.message = data.message || "";
    this.lastModified = Date.utc.create(data.modified);
    this.commentCount = data.num_comments || 0;
    this.created = Date.utc.create(data.created);

    var files = data.files || {};
    this.files = Object.keys(files).sort().map(function(name) {
        var file = new PatchFile(patchset, name);
        file.parseData(files[name]);
        return file;
    });

    this.tryJobResults = (data.try_job_results || []).map(function(resultData) {
        var result = new TryJobResult();
        result.parseData(resultData);
        return result;
    });
};
