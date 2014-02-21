
function createImage(name)
{
    return new Image(chrome.extension.getURL("ui/images/" + name));
}

function createScript(name)
{
    var script = chrome.extension.getURL("ui/" + name);
    script.src = this.url;
    return script;
}

function createStyle(name)
{
    var link = document.createElement("link");
    link.href = chrome.extension.getURL("ui/styles/" + name)
    link.rel = "stylesheet";
    return link;
}
