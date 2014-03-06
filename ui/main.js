
// Blank the document so the 404 page doesn't show up visibly.
document.documentElement.style.display = 'none';

// Can't use DOMContentLoaded, calling document.write or document.close inside it from
// inside an extension causes a crash.
onload = function() {
    document.write(
        "<!DOCTYPE html>" +
        "<meta name=viewport content='width=device-width, user-scalable=no'>" +
        "<script src='" + resolveUrl("bower_components/platform/platform.js") + "'></script>" +
        "<cr-app></cr-app>"
    );
    document.close();

    document.documentElement.style.display = '';
    document.head.appendChild(createLink("import", "bower_components/polymer/polymer.html"));
    document.head.appendChild(createLink("import", "ui/cr-app.html"));
    document.head.appendChild(createLink("stylesheet", "ui/style.css"));
};
