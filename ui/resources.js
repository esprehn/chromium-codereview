
function loadResource(type, url)
{
    return new Promise(function(fulfill, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = type;
        xhr.open("GET", url);
        xhr.send();
        xhr.onload = function() {
            fulfill(xhr);
        };
        xhr.onerror = function(e) {
            reject(xhr);
        };
    });
}

function loadText(url)
{
    return loadResource("text", url).then(function(xhr) {
        return xhr.responseText;
    });
}

function loadDocument(url)
{
    return loadResource("document", url).then(function(xhr) {
        return xhr.responseXML;
    });
}

function loadJSON(url)
{
    return loadResource("json", url).then(function(xhr) {
        return xhr.response;
    });
}

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
