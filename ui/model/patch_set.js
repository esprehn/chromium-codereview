
// https://codereview.chromium.org/api/148223004/70001/?comments=true
function PatchSet()
{
    this.files = []; // Array<PatchFile>
    this.created = ""; // Date
    this.url = "";
    this.comments = 0;
    this.modified = ""; // Date
    this.patchset = 0;
    this.issue = 0;
    this.owner = null // User
    this.message = "";
}
