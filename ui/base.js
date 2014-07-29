
// Borrowed from sugar.js HEAD since startsWith/endsWith were very slow when
// they supported regexps.
(function() {
    function getCoercedStringSubject(obj) {
        if(obj == null) {
            throw new TypeError();
        }
        return String(obj);
    }

    function getCoercedSearchString(obj, errorOnRegex) {
        if(errorOnRegex && obj instanceof RegExp) {
            throw new TypeError();
        }
        return String(obj);
    }

    String.prototype.startsWith = function(searchString) {
        var str, start, pos, len, searchLength, position = arguments[1];
        str = getCoercedStringSubject(this);
        searchString = getCoercedSearchString(searchString, true);
        pos = Number(position) || 0;
        len = str.length;
        start = Math.min(Math.max(pos, 0), len);
        searchLength = searchString.length;
        if(searchLength + start > len) {
            return false;
        }
        if(str.substr(start, searchLength) === searchString) {
            return true;
        }
        return false;
    };

    String.prototype.endsWith = function(searchString) {
        var str, start, end, pos, len, searchLength, endPosition = arguments[1];
        str = getCoercedStringSubject(this);
        searchString = getCoercedSearchString(searchString, true);
        len = str.length;
        pos = len;
        if(endPosition != undefined) {
            pos = Number(endPosition) || 0;
        }
        end = Math.min(Math.max(pos, 0), len);
        searchLength = searchString.length;
        start = end - searchLength;
        if(start < 0) {
            return false;
        }
        if(str.substr(start, searchLength) === searchString) {
            return true;
        }
        return false;
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
