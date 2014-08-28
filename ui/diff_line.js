"use strict";

function DiffLine(type)
{
    this.type = type;
    this.beforeNumber = 0;
    this.afterNumber = 0;
    this.contextLinesStart = 0;
    this.contextLinesEnd = 0;
    this.context = false;
    this.text = "";
}
