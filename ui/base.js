"use strict";

(function() {

function clampToLength(value, defaultValue, maxValue) {
    if (value === undefined)
        return defaultValue;
    return Math.min(Math.max(value, 0), maxValue) || 0;
}

// FIXME: Remove this once sugar is updated. 1.4.1 has very slow startsWith
// because of the regex code in it.
String.prototype.startsWith = function(input) {
    if (this == null)
        throw new TypeError();
    var subject = String(this);
    if (input instanceof RegExp)
        throw new TypeError();
    var search = String(input);
    var position = clampToLength(arguments[1], 0, subject.length);
    return subject.lastIndexOf(search, position) == position;
};

// FIXME: Remove this once sugar is updated. 1.4.1 has very slow endsWith
// because of the regex code in it.
String.prototype.endsWith = function(input) {
    if (this == null)
        throw new TypeError();
    var subject = String(this);
    if (input instanceof RegExp)
        throw new TypeError();
    var search = String(input);
    var position = clampToLength(arguments[1], subject.length, subject.length);
    position -= search.length;
    var lastIndex = subject.indexOf(search, position);
    return lastIndex != -1 && lastIndex == position;
};

})();

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

Promise.prototype.either = function(fn) {
    this.then(fn, fn);
};
