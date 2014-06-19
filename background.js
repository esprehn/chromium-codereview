
var APPSPOT_URL_PATTERN = /^https?:\/\/chromiumcodereview\.appspot\.com/;
var APP_REDIRECT_URL_PATTERN = /^https?:\/\/([^\/]+)\/(((\d+)|login|user\/[^\/]+|settings)?\/?(#.*)?)$/;
var LEGACY_REDIRECT_URL_PATTERN = /^https:\/\/(codereview.chromium.org)\/static\/app\/#\/issue\/(\d+)?\/?$/;

var CHROMIUM_URL = "https://codereview.chromium.org";
var APP_PREFIX = "/static/app/";

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.type != "main_frame" && details.type != "sub_frame")
        return;
    var url = details.url;
    if (url.match(APPSPOT_URL_PATTERN)) {
        var url = url.replace(APPSPOT_URL_PATTERN, CHROMIUM_URL);
        return {redirectUrl: url};
    }
    var match = url.match(APP_REDIRECT_URL_PATTERN);
    if (!match)
        match = url.match(LEGACY_REDIRECT_URL_PATTERN);
    if (!match)
        return;
    var url = "https://" + match[1] + APP_PREFIX + (match[2] || "");
    return {redirectUrl: url};
}, {
    urls: [
        "*://chromiumcodereview.appspot.com/*",
        "*://codereview.chromium.org/*",
        "*://codereview.appspot.com/*",
    ]
}, [
    "blocking"
]);
