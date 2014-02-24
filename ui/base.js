
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
