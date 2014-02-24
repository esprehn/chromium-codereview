
function TryJobResultStep(result, name)
{
    this.result = result || null;
    this.name = name || "";
}

TryJobResultStep.prototype.getDetailUrl = function()
{
    return this.result.getDetailUrl() + "/steps/" + encodeURIComponent(this.name);
};
