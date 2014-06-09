
var APPSPOT_URL_PATTERN = /^https?:\/\/chromiumcodereview\.appspot\.com/;
var APP_REDIRECT_URL_PATTERN = /^https?:\/\/codereview\.chromium\.org\/(\d+)?\/?$/;

var CHROMIUM_URL = "https://codereview.chromium.org";
var APP_URL = "https://codereview.chromium.org/static/app/";

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    var url = details.url;
    if (url.match(APPSPOT_URL_PATTERN)) {
        var url = url.replace(APPSPOT_URL_PATTERN, CHROMIUM_URL);
        chrome.tabs.update(details.tabId, {url:url});
        return;
    }
    var match = url.match(APP_REDIRECT_URL_PATTERN);
    if (!match)
        return;
    var issueId = parseInt(match[1], 10);
    var url = APP_URL;
    if (issueId)
        url += "#/issue/" + issueId;
    chrome.tabs.update(details.tabId, {url:url});
});
