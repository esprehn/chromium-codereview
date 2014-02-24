
// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet(id)
{
    this.files = []; // Array<PatchFile>
    this.created = ""; // Date
    this.url = "";
    this.comments = 0;
    this.modified = ""; // Date
    this.issueId = 0;
    this.owner = null // User
    this.message = "";
    this.id = id || 0;
}
