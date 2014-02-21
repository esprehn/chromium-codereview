
var util = _;

function loadDocument(url)
{
    return new Promise(function(fulfill, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        xhr.open("GET", url);
        xhr.send();
        xhr.onload = function() {
            fulfill(xhr.responseXML);
        };
        xhr.onerror = function(e) {
            reject(e);
        };
    });
}
