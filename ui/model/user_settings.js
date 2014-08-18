"use strict";

function UserSettings()
{
    this.name = "";
    this.context = "";
    this.columnWidth = 0;
    this.notifyByChat = false;
}

UserSettings.DETAIL_URL = "/settings";

UserSettings.FIELD_NAME_MAP = {
    "nickname": "name",
    "notify_by_chat": "notifyByChat",
    "column_width": "columnWidth",
    "context": "context",
};

UserSettings.prototype.loadDetails = function()
{
    var settings = this;
    return loadDocument(UserSettings.DETAIL_URL).then(function(doc) {
        settings.parseDocument(doc);
        return settings;
    });
};

UserSettings.prototype.parseDocument = function(doc)
{
    this.name = User.current.name;

    var context = doc.getElementById("id_context");
    if (context && context.selectedOptions && context.selectedOptions.length)
        this.context = context.selectedOptions[0].value;

    var columnWidth = doc.getElementById("id_column_width");
    if (columnWidth)
        this.columnWidth = parseInt(columnWidth.value, 10) || 0;

    var notifyByChat = doc.getElementById("id_notify_by_chat");
    if (notifyByChat)
        this.notifyByChat = notifyByChat.checked;
};

UserSettings.prototype.save = function()
{
    var settings = this;
    return this.createSaveData().then(function(data) {
        return sendFormData(UserSettings.DETAIL_URL, data).then(function(xhr) {
            var errorData = parseFormErrorData(xhr.response);
            if (!errorData) {
                // Synchronize the user's name now that we've saved it to the server.
                return User.loadCurrentUser().then(function() {
                    return settings;
                });
            }
            var error = new Error(errorData.message);
            error.fieldName = UserSettings.FIELD_NAME_MAP[errorData.fieldName] || errorData.fieldName;
            throw error;
        });
    });
};

UserSettings.prototype.createSaveData = function()
{
    var settings = this;
    return User.loadCurrentUser().then(function(user) {
        return {
            nickname: settings.name,
            xsrf_token: user.xsrfToken,
            notify_by_chat: settings.notifyByChat ? "on" : "",
            notify_by_email: "on",
            column_width: settings.columnWidth,
            context: settings.context,
        };
    });  
};
