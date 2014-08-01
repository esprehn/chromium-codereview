"use strict";

function SearchResult(issues, cursor)
{
    this.cursor = cursor || "";
    this.issues = issues || []; // Array<Issue>
}

SearchResult.prototype.findNext = function()
{
    return Search.findIssues({cursor: this.cursor});
};
