
function TryJobResult()
{
    this.tests = [];
    this.slave = "";
    this.url = "";
    this.timestamp = ""; // Date
    this.builder = "";
    this.clobber = false;
    this.project = "";
    this.reason = "";
    this.result = "";
    // this.key = ""; // What is this for?
    this.requester = null; // User
    this.buildnumber = 0;
    this.revision = ""; // Number or HEAD
}

// FIXME: We could probably replace this and the hard coded job lists below with
// usage of the JSON API. ex. http://build.chromium.org/p/tryserver.blink/json/builders
TryJobResult.URL = "http://build.chromium.org/p/{1}/builders/{2}/builds/{3}";

TryJobResult.RESULT = {
    "-1": "pending",
    "0": "success",
    "1": "warnings",
    "2": "failure",
    "3": "skipped",
    "4": "exception",
    "5": "retry",
    // It's not clear from the Rietveld code if pending is -1 or 6, the server seems to reply with -1?
    "6": "pending",
};

TryJobResult.prototype.getDetailUrl = function()
{
    return this.url;
};

TryJobResult.prototype.getServerName = function()
{
    var builder = this.builder.replace("_triggered_tests", "");
    return TryServers.BUILDER_TO_SERVER[builder] || "";
};

TryJobResult.prototype.parseData = function(data)
{
    // FIXME: We should use the .master and .url properties.
    var result = this;
    this.tests = (data.tests || []).map(function(name) {
        return new TryJobResultStep(result, name);
    });
    this.slave = data.slave || "";
    this.timestamp = Date.utc.create(data.timestamp);
    this.builder = data.builder || "";
    this.clobber = data.clobber || false;
    this.project = data.project || "";
    this.reason = data.reason || "";
    this.result = TryJobResult.RESULT[data.result] || "";
    this.requester = new User(data.requester);
    this.buildnumber = parseInt(data.buildnumber, 10) || 0;
    this.revision = data.revision || "";
    var serverName = this.getServerName();
    if (serverName) {
        this.url = TryJobResult.URL.assign(
            encodeURIComponent(serverName),
            encodeURIComponent(this.builder),
            this.buildnumber);
    }
};
