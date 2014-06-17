
function UserSettings()
{
    this.name = "";
    this.context = 0;
    this.columnWidth = 0;
    this.notifyByChat = false;
}

UserSettings.DETAIL_URL = "/settings";

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
        this.context = parseInt(context.selectedOptions[0].value, 10) || 0;

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
        return sendFormData(UserSettings.DETAIL_URL, data).then(function() {
            // Synchronize the user's name now that we've saved it to the server.
            User.current.name = settings.name;
            return settings;
        });
    });
};

UserSettings.prototype.createSaveData = function()
{
    var settings = this;
    return User.loadCurrentUser(true).then(function(user) {
        return {
            nickname: settings.name,
            xsrfToken: user.xsrfToken,
            notify_by_chat: settings.notifyByChat ? "on" : "",
            notify_by_email: "on",
            column_width: settings.columnWidth,
            context: settings.context,
        };
    });  
};
