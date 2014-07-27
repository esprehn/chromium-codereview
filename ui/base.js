
// Polymer provides this, but we add it just in case so you can use models
// without polymer.
if (!NodeList.prototype.array) {
    NodeList.prototype.array = function() {
        return Array.prototype.slice.call(this);
    };
}

// Manually implement this so that Shadow DOM polyfill works.
// https://github.com/Polymer/ShadowDOM/issues/395
if (!Element.prototype.remove) {
    Element.prototype.remove = function() {
        if (!this.parentNode)
            return;
        this.parentNode.removeChild(this);
    };
}

// We only have String#contains if "Experimental JavaScript is enabled."
if (!String.prototype.contains) {
    String.prototype.contains = function(text) {
        return this.indexOf(text) != -1;
    };
}
