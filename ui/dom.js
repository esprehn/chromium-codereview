"use strict";

function resolveUrl(name)
{
    if (!chrome || !chrome.extension)
        return name;
    return chrome.extension.getURL(name);
}

function createImage(name)
{
    var image = new Image();
    image.src = resolveUrl(name);
    return image;
}

function createScript(name)
{
    var script = document.createElement("script");
    script.src = resolveUrl(name);
    return script;
}

function createLink(type, name)
{
    var link = document.createElement("link");
    link.href = resolveUrl(name);
    link.rel = type;
    return link;
}

function createAnchor(href, text)
{
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    a.target = "_blank";
    return a;
}
