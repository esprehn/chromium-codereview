
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

function sendFormData(url, data)
{
    return new Promise(function(fulfill, reject) {
        var formData = Object.keys(data).map(function(key) {
            return key + "=" + encodeURIComponent(data[key]);
        }).join("&");

        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(formData);
        xhr.onload = function() {
            fulfill(xhr);
        };
        xhr.onerror = function() {
            reject(xhr);
        };
    });
}
