(function() {

var loaders = [];

function createLoader(type)
{
    var loader = function(url) {
        var map = loader.expectations;
        if (!map[url] || !map[url].length)
            throw new Error("No " + type + " expectation for " + url);
        var callback = map[url].shift();
        return callback.apply(null, arguments);
    };
    loader.expect = function(url, callback) {
        loader.expectations[url] = loader.expectations[url] || [];
        loader.expectations[url].push(callback);
    };
    loader.reset = function() {
        loader.expectations = {};
    };
    loader.reset();
    loaders.push(loader);
    return loader;
}

window.loadText = createLoader("text");
window.loadDocument = createLoader("document");
window.loadJSON = createLoader("json");
window.sendFormData = createLoader("formData");

window.resetExpectations = function()
{
    loaders.forEach(function(loader) {
        loader.reset();
    });
};

beforeEach(function() {
  resetExpectations();
});

})();
