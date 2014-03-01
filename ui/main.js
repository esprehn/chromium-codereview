
// Can't use DOMContentLoaded, calling document.write or document.close inside it from
// inside an extension causes a crash.
onload = function() {
    document.write("<!DOCTYPE html><script src='" + resolveUrl("bower_components/platform/platform.js") + "'></script><cr-app></cr-app>");
    document.close();

    document.head.appendChild(createImport("bower_components/polymer/polymer.html"));
    document.head.appendChild(createImport("ui/components/cr-app.html"));
    document.head.appendChild(createStyleLink("ui/style.css"));
};
