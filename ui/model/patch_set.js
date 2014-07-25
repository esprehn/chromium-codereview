
// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet(issue, id)
{
    this.files = []; // Array<PatchFile>
    this.tryJobResults = []; // Array<tryJobResults>
    this.created = ""; // Date
    this.messageCount = 0;
    this.draftCount = 0;
    this.lastModified = ""; // Date
    this.issue = issue || null;
    this.owner = null // User
    this.message = "";
    this.id = id || 0;
    this.commit = false;
    this.mostRecent = false;
}

PatchSet.DETAIL_URL = "/api/{1}/{2}/?comments=true"
PatchSet.REVERT_URL = "/api/{1}/{2}/revert";

PatchSet.isSourcePair = function(header, impl)
{
    if (!header.endsWith(".h") || !impl.endsWith(".cpp"))
        return false;
    var headerPrefix = header.substring(0, header.length - 2);
    var implPrefix = impl.substring(0, impl.length - 4);
    return headerPrefix == implPrefix;
};

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
    var patchset = this;
    return this.createRevertData(options).then(function(data) {
        return sendFormData(patchset.getRevertUrl(), data);
    });
};

PatchSet.prototype.createRevertData = function(options)
{
    return User.loadCurrentUser(true).then(function(user) {
        return {
            xsrf_token: user.xsrfToken,
            revert_reason: options.reason,
            revert_cq: options.commit ? "1" : "0",
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
    this.created = Date.utc.create(data.created);

    Object.keys(data.files || {}, function(name, value) {
        var file = new PatchFile(patchset, name);
        file.parseData(value);
        patchset.files.push(file);
    });

    this.files.sort(function(a, b) {
        if (PatchSet.isSourcePair(a.name, b.name))
            return -1;
        if (PatchSet.isSourcePair(b.name, a.name))
            return 1;
        return a.name.localeCompare(b.name);
    });

    this.tryJobResults = (data.try_job_results || []).map(function(resultData) {
        var result = new TryJobResult();
        result.parseData(resultData);
        return result;
    });

    this.tryJobResults.sort(function(a, b) {
        if (a.resultGroup == b.resultGroup)
            return a.builder.localeCompare(b.builder);
        return a.resultGroup - b.resultGroup;
    });
};
