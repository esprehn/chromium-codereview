
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
    this.result = 0;
    this.key = "",
    this.requester = null; // User
    this.buildnumber = 0;
    this.revision = 0;
}

TryJobResult.RESULT = ["success", "warnings", "failure", "skipped", "exception", "retry", "pending"];

TryJobResult.prototype.parseData = function(data)
{
    // FIXME: Implement me.
};
