
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
        xhr.onerror = function() {
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
        if (!xhr.responseXML)
            throw new Error("Not found");
        return xhr.responseXML;
    });
}

function loadJSON(url)
{
    return loadResource("json", url).then(function(xhr) {
        if (!xhr.response)
            throw new Error("Not found");
        return xhr.response;
    });
}

function resolveUrl(name)
{
    return chrome.extension.getURL(name);
}

function createImage(name)
{
    var image = new Image();
    image.src = resolveUrl(name);
    return image;
}

function createScript(name)
{
    var script = document.createElement("script");
    script.src = resolveUrl(name);
    return script;
}

function createLink(type, name)
{
    var link = document.createElement("link");
    link.href = resolveUrl(name);
    link.rel = type;
    return link;
}
