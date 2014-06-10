
describe("PatchFile", function() {
    it("should parse file extensions into syntax highlighting languages", function() {
        expect(PatchFile.computeLanguage("")).toBe("");
        expect(PatchFile.computeLanguage("Document.h")).toBe("cpp");
        expect(PatchFile.computeLanguage("Document.cpp")).toBe("cpp");
        expect(PatchFile.computeLanguage("path/test.html")).toBe("html");
        expect(PatchFile.computeLanguage("dir/test.xhtml")).toBe("html");
        expect(PatchFile.computeLanguage("example.js")).toBe("javascript");
        expect(PatchFile.computeLanguage("this_is.file.css")).toBe("css");
        expect(PatchFile.computeLanguage("image.xml")).toBe("xml");
        expect(PatchFile.computeLanguage("image.svg")).toBe("xml");
        expect(PatchFile.computeLanguage("horror.pl")).toBe("perl");
        expect(PatchFile.computeLanguage("horror2.pm")).toBe("perl");
        expect(PatchFile.computeLanguage("//./.py/horror1.cgi")).toBe("perl");
        expect(PatchFile.computeLanguage("snakesonaplane.py")).toBe("python");
        expect(PatchFile.computeLanguage("gems.rb")).toBe("ruby");
        expect(PatchFile.computeLanguage("cocoa.mm")).toBe("objectivec");
        expect(PatchFile.computeLanguage("../.file/data.json")).toBe("json");
        expect(PatchFile.computeLanguage("Document.idl")).toBe("actionscript");
        expect(PatchFile.computeLanguage("Document.map")).toBe("");
        expect(PatchFile.computeLanguage("Document.h.")).toBe("");
        expect(PatchFile.computeLanguage("Document.cpp/")).toBe("");
    });
    it("should maintain message counts", function() {
        var file = new PatchFile();

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
        expect(file.messageCount).toBe(1);
        expect(file.draftCount).toBe(1);

        file.removeMessage(message);
        expect(file.messages[10]).toEqual([draft]);
        expect(file.messageCount).toBe(0);
        expect(file.draftCount).toBe(1);

        file.removeMessage(draft);
        expect(file.messages[10]).toEqual([]);
        expect(file.messageCount).toBe(0);
        expect(file.draftCount).toBe(0);
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
