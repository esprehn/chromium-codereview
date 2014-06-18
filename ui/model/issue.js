
// https://codereview.chromium.org/api/148223004/?messages=true
// FIXME: support loading all drafts by parsing /publish and then doing PatchFile.loadDrafts()
function Issue(id)
{
    this.description = "";
    this.cc = []; // Array<User>
    this.reviewers = []; // Array<User>
    this.messages = []; // Array<IssueMessage>
    this.messageCount = 0;
    this.owner = null; // User
    this.private = false;
    this.baseUrl = "";
    this.subject = "";
    this.created = ""; // Date
    this.patchsets = []; // Array<PatchSet>
    this.lastModified = ""; // Date
    this.closed = false;
    this.commit = false;
    this.id = id || 0;
    this.scores = {}; // Map<email, (-1, 1)>
    this.approvalCount = 0;
    this.disapprovalCount = 0;
    this.recentActivity = false;
}

Issue.DETAIL_URL = "/api/{1}?messages=true";
Issue.PUBLISH_URL = "/{1}/publish";
Issue.EDIT_URL = "/{1}/edit";
Issue.CLOSE_URL = "/{1}/close";
Issue.FLAGS_URL = "/{1}/edit_flags";

Issue.prototype.getDetailUrl = function()
{
    return Issue.DETAIL_URL.assign(encodeURIComponent(this.id));
};

Issue.prototype.getPublishUrl = function()
{
    return Issue.PUBLISH_URL.assign(encodeURIComponent(this.id));
};

Issue.prototype.getEditUrl = function()
{
    return Issue.EDIT_URL.assign(encodeURIComponent(this.id));
};

Issue.prototype.getFlagsUrl = function()
{
    return Issue.FLAGS_URL.assign(encodeURIComponent(this.id));
};

Issue.prototype.getCloseUrl = function()
{
    return Issue.CLOSE_URL.assign(encodeURIComponent(this.id));
};

Issue.prototype.reviewerEmails = function()
{
    return this.reviewers.map(function(user) {
        return user.email;
    }).join(", ");
};

Issue.prototype.ccEmails = function()
{
    return this.cc.map(function(user) {
        return user.email;
    }).join(", ");
};

Issue.prototype.loadDetails = function()
{
    var issue = this;
    return loadJSON(this.getDetailUrl()).then(function(data) {
        issue.parseData(data);
        return issue;
    });
};

Issue.prototype.parseData = function(data)
{
    var issue = this;
    if (this.id !== data.issue)
        throw new Error("Incorrect issue loaded " + this.id + " != " + data.issue);
    this.baseUrl = data.base_url || "";
    this.closed = data.closed || false;
    this.commit = data.commit || false;
    this.created = Date.utc.create(data.created);
    this.description = data.description || "";
    this.lastModified = Date.utc.create(data.modified);
    this.owner = User.forName(data.owner, data.owner_email);
    this.private = data.private;
    this.subject = data.subject || "";
    this.cc = (data.cc || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.reviewers = (data.reviewers || []).map(function(email) {
        return User.forMailingListEmail(email);
    });
    this.patchsets = (data.patchsets || []).map(function(patchsetId) {
        return new PatchSet(issue, patchsetId);
    });
    this.messages = (data.messages || []).map(function(messageData) {
        var message = new IssueMessage(issue);
        message.parseData(messageData);
        return message;
    });
    this.updateScores();
    this.reviewers.sort(User.compare);
    this.cc.sort(User.compare);
    if (this.patchsets.length) {
        var last = this.patchsets.last();
        last.commit = this.commit;
        last.mostRecent = true;
    }
    // Overwrite the count in case they differ (ex. new comments were added since
    // the summary list was loaded).
    this.messageCount = this.messages.length;
};

Issue.prototype.updateScores = function() {
    var issue = this;
    var reviewerEmails = {};
    this.reviewers.forEach(function(user) {
        reviewerEmails[user.email] = true;
    });
    this.messages.forEach(function(message) {
        if (!message.approval && !message.disapproval)
            return;
        var email = message.author.email;
        if (message.approval) {
            issue.scores[email] = 1;
            issue.approvalCount++;
        } else if (message.disapproval) {
            issue.scores[email] = -1;
            issue.disapprovalCount++;
        }
        // Rietveld allows removing reviewers even if they lgtm or not lgtm a patch,
        // but still treats them as a reviewer even though the JSON API won't return
        // that user anymore. We add them back here to compensate for the JSON API
        // not having the right users.
        if (!reviewerEmails[email]) {
            reviewerEmails[email] = true;
            issue.reviewers.push(User.forMailingListEmail(email));
        }
    });
};

Issue.prototype.toggleClosed = function()
{
    // If we're already closed the only way to reopen is to edit().
    if (this.closed) {
        return this.edit({
            subject: this.subject,
            description: this.description,
            reviewers: this.reviewerEmails(),
            cc: this.ccEmails(),
            closed: false,
            private: this.private,
        });
    }
    var issue = this;
    return User.loadCurrentUser(true).then(function(user) {
        return sendFormData(issue.getCloseUrl(), {
            xsrf_token: user.xsrfToken,
        });
    });
};

Issue.prototype.edit = function(options)
{
    var issue = this;
    return this.createEditData(options).then(function(data) {
        return sendFormData(issue.getEditUrl(), data).then(function(xhr) {
            var errorData = parseFormErrorData(xhr.response);
            if (!errorData)
                return issue;
            var error = new Error(errorData.message);
            error.fieldName = errorData.fieldName;
            throw error;
        });
    });
};

Issue.prototype.createEditData = function(options)
{
    return User.loadCurrentUser(true).then(function(user) {
        return {
            xsrf_token: user.xsrfToken,
            subject: options.subject,
            description: options.description,
            reviewers: options.reviewers,
            cc: options.cc,
            closed: options.closed ? "on" : "",
            private: options.private ? "on" : "",
        };
    });
};

Issue.prototype.publish = function(options)
{
    var issue = this;
    return this.createPublishData(options).then(function(data) {
        return sendFormData(issue.getPublishUrl(), data).then(function() {
            return issue;
        });
    });
};

Issue.prototype.createPublishData = function(options)
{
    var issue = this;
    return User.loadCurrentUser(true).then(function(user) {
        var message = options.message || "";
        var addAsReviewer = options.addAsReviewer;
        var publishDrafts = options.publishDrafts;
        var commit = options.commit;
        var reviewers = Object.has(options, "reviewers") ? options.reviewers : issue.reviewerEmails();
        var cc = Object.has(options, "cc") ? options.cc : issue.ccEmails();
        if (options.lgtm) {
            message = "lgtm\n\n" + message;
            addAsReviewer = true;
            publishDrafts = true;
        }
        return {
            xsrf_token: user.xsrfToken,
            subject: issue.subject,
            message_only: publishDrafts ? "0" : "1",
            add_as_reviewer: addAsReviewer ? "1" : "0",
            commit: commit ? "1" : "0",
            message: message,
            send_mail: "1",
            reviewers: reviewers,
            cc: cc,
        };
    });
};

Issue.prototype.setFlags = function(options)
{
    var issue = this;
    return this.createFlagsData(options).then(function(data) {
        return sendFormData(issue.getFlagsUrl(), data).then(function() {
            return issue;
        });
    });
};

Issue.prototype.createFlagsData = function(options)
{
    var lastPatchsetId = this.patchsets.last().id;
    return User.loadCurrentUser(true).then(function(user) {
        var data = {
            xsrf_token: user.xsrfToken,
            last_patchset: lastPatchsetId,
        };
        if (Object.has(options, "commit"))
            data.commit = options.commit ? 1 : 0;
        if (options.builders && options.builders.length)
            data.builders = TryServers.createFlagValue(options.builders);
        return data;
    });
};
