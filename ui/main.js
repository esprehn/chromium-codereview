"use strict";

// Blank the document so the 404 page doesn't show up visibly.
document.documentElement.style.display = 'none';

// Can't use DOMContentLoaded, calling document.write or document.close inside it from
// inside an extension causes a crash.
window.addEventListener("load", function() {
    function resolveUrl(name) {
        if (!chrome || !chrome.extension)
            return name;
        return chrome.extension.getURL(name);
    }

    // FIXME: Work around http://crbug.com/411111 where the title won't dynamically
    // update anymore in Chrome 37 unless we reuse the same <title> element.
    var title = document.querySelector("title");
    title.textContent = "Chromium Code Review";
    document.write(
        "<!DOCTYPE html>" +
        "<meta name=viewport content='initial-scale=1, maximum-scale=1, user-scalable=no'>" +
        "<script src='" + resolveUrl("bower_components/platform/platform.js") + "'></script>" +
        "<script>EXTENSION_URL = '" + resolveUrl("") + "';</script>" +
        "<link rel='import' href='" + resolveUrl("ui/components/cr-app.html") + "'>" +
        "<link rel='stylesheet' href='" + resolveUrl("ui/style.css") + "'>" +
        "<cr-app></cr-app>"
    );
    document.close();
    document.head.appendChild(title);
    document.documentElement.style.display = '';
});
