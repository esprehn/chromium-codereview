"use strict";

describe("PatchFile", function() {
    it("should parse file extensions into syntax highlighting languages", function() {
        expect(new PatchFile(null, "").language).toBe("");
        expect(new PatchFile(null, "Document.h").language).toBe("cpp");
        expect(new PatchFile(null, "Document.cpp").language).toBe("cpp");
        expect(new PatchFile(null, "path/test.html").language).toBe("html");
        expect(new PatchFile(null, "dir/test.xhtml").language).toBe("html");
        expect(new PatchFile(null, "example.js").language).toBe("javascript");
        expect(new PatchFile(null, "this_is.file.css").language).toBe("css");
        expect(new PatchFile(null, "image.xml").language).toBe("xml");
        expect(new PatchFile(null, "image.svg").language).toBe("xml");
        expect(new PatchFile(null, "horror.pl").language).toBe("perl");
        expect(new PatchFile(null, "horror2.pm").language).toBe("perl");
        expect(new PatchFile(null, "//./.py/horror1.cgi").language).toBe("perl");
        expect(new PatchFile(null, "snakesonaplane.py").language).toBe("python");
        expect(new PatchFile(null, "gems.rb").language).toBe("ruby");
        expect(new PatchFile(null, "cocoa.mm").language).toBe("objectivec");
        expect(new PatchFile(null, "../.file/data.json").language).toBe("json");
        expect(new PatchFile(null, "Document.idl").language).toBe("actionscript");
        expect(new PatchFile(null, "Document.map").language).toBe("");
        expect(new PatchFile(null, "Document.h.").language).toBe("");
        expect(new PatchFile(null, "Document.cpp/").language).toBe("");
        expect(new PatchFile(null, "prefetch_messages.cc").language).toBe("cpp");
    });
    it("should handle embedded language selection", function() {
        var html = new PatchFile(null, "example.html");
        expect(html.selectEmbeddedLanguage("<script type=\"foo\"></script>")).toBe("html");
        expect(html.selectEmbeddedLanguage("<script></script>")).toBe("html");
        expect(html.selectEmbeddedLanguage("<script>function() { return 1/script>2; }</script>")).toBe("html");
        expect(html.selectEmbeddedLanguage("<script>")).toBe("javascript");
        expect(html.selectEmbeddedLanguage("<script type=\"foo\">")).toBe("javascript");
        expect(html.selectEmbeddedLanguage("</script>")).toBe("html");
        expect(html.selectEmbeddedLanguage("<style>")).toBe("css");
        expect(html.selectEmbeddedLanguage("<style type=example>")).toBe("css");
        expect(html.selectEmbeddedLanguage("<style type=example>.foo { }</style>")).toBe("html");
        expect(html.selectEmbeddedLanguage("<style type=example></style>")).toBe("html");
        var text = new PatchFile(null, "example.cpp");
        expect(text.selectEmbeddedLanguage("<script></script>")).toBe("cpp");
        expect(text.selectEmbeddedLanguage("<style></style>")).toBe("cpp");
    });
    it("should maintain message counts", function() {
        var issue = new Issue(1);
        var file = new PatchFile(new PatchSet(issue, 2));

        expect(file.messageCount).toBe(0);
        expect(file.draftCount).toBe(0);

        var message = new PatchFileMessage();
        message.line = 10;
        file.addMessage(message);
        expect(file.messages[10]).toEqual([message]);
        expect(file.messageCount).toBe(1);
        expect(file.draftCount).toBe(0);

        var draft = new PatchFileMessage();
        draft.line = 10;
        draft.draft = true;
        file.addMessage(draft);
        expect(file.messages[10]).toEqual([message, draft]);
        expect(file.messageCount).toBe(2);
        expect(file.draftCount).toBe(1);
        expect(issue.draftCount).toBe(1);

        file.removeMessage(message);
        expect(file.messages[10]).toEqual([draft]);
        expect(file.messageCount).toBe(1);
        expect(file.draftCount).toBe(1);
        expect(issue.draftCount).toBe(1);

        file.removeMessage(draft);
        expect(file.messages[10]).toEqual([]);
        expect(file.messageCount).toBe(0);
        expect(file.draftCount).toBe(0);
        expect(issue.draftCount).toBe(0);
    });
    it("should only parse positive or zero delta numbers", function() {
        var file = new PatchFile();

        expect(file.added).toBe(0);
        expect(file.removed).toBe(0);

        file.added = 10;
        file.removed = 5;
        expect(file.added).toBe(10);
        expect(file.removed).toBe(5);

        file.parseData({
                num_added: -1,
                num_removed: -10,
        });
        expect(file.added).toBe(0);
        expect(file.removed).toBe(0);

        file.parseData({
                num_added: 8,
                num_removed: 4,
        });
        expect(file.added).toBe(8);
        expect(file.removed).toBe(4);
    });
});
