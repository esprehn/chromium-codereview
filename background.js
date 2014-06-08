
var URL_PATTERN = /^https?:\/\/codereview.chromium.org\/(\d+)?\/?$/;
var APP_URL = "https://codereview.chromium.org/static/app/";

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    var url = details.url;
    var match = url.match(URL_PATTERN);
    if (!match)
        return;
    var issueId = parseInt(match[1], 10);
    var url = APP_URL;
    if (issueId)
        url += "#/issue/" + issueId;
    chrome.tabs.update(details.tabId, {url:url});
});
