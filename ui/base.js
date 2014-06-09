
function toArray(value)
{
    return Array.prototype.slice.call(value);
}

// Manually implement this so that Shadow DOM polyfill works.
// https://github.com/Polymer/ShadowDOM/issues/395
Element.prototype.remove = function()
{
    if (!this.parentNode)
        return;
    this.parentNode.removeChild(this);
}
