"use strict";

// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet(issue, id, sequence)
{
    this.files = []; // Array<PatchFile>
    this.sourceFiles = []; // Array<PatchFile>
    this.testFiles = []; // Array<PatchFile>
    this.tryJobResults = []; // Array<tryJobResults>
    this.created = ""; // Date
    this.messageCount = 0;
    this.draftCount = 0;
    this.lastModified = ""; // Date
    this.issue = issue || null;
    this.owner = null // User
    this.message = "";
    this.id = id || 0;
    this.sequence = sequence || 0;
    this.commit = false;
    this.mostRecent = false;
    this.active = false;
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
    var patchset = this;
    return this.createRevertData(options).then(function(data) {
        return sendFormData(patchset.getRevertUrl(), data);
    });
};

PatchSet.prototype.createRevertData = function(options)
{
    return User.loadCurrentUser().then(function(user) {
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

    this.files.sort(PatchFile.compare);

    this.files.forEach(function(file) {
        if (file.isLayoutTest)
            this.testFiles.push(file);
        else
            this.sourceFiles.push(file);
    }, this);

    var tryResults = (data.try_job_results || []).groupBy("builder");
    this.tryJobResults = Object.keys(tryResults)
        .sort()
        .map(function(builder) {
            var jobSet = new TryJobResultSet(builder);
            jobSet.results = tryResults[builder].map(function(resultData) {
                var result = new TryJobResult();
                result.parseData(resultData);
                return result;
            }).reverse();
            return jobSet;
        });
};
