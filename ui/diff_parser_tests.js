"use strict";

describe("DiffParser", function() {
    it("should parse headers", function() {
        var pattern = DiffParser.HEADER_PATTERN;
        expect("@@ -1,1 +1,1 @@ text here").toMatch(pattern);
        expect("@@ -2,1 +1,1 @@").toMatch(pattern);
        expect("@@ -3 +1,1 @@").toMatch(pattern);
        expect("@@ -4,1 +1 @@").toMatch(pattern);
        expect("@@ -5,12 +1,1 @@").toMatch(pattern);
        expect("@@ -6,1 +12,1 @@").toMatch(pattern);
        expect("@@ -7,55 +12,1 @@").toMatch(pattern);
        expect("@@ -81,1 +1,1 @@ suffix").toMatch(pattern);
        expect("@@ -9,12 +1,11 @@").toMatch(pattern);
    });
    it("should not show context link for file deletes", function() {
        var text =
            "Index: example.cc\n" +
            "diff --git a/example.cc b/example.cc\n" +
            "index aaf..def 100644\n" +
            "--- a/example.cc\n" +
            "+++ b/example.cc\n" +
            "@@ -1,1 +0,0 @@ File deleted\n" +
            "- This was a line\n";
        var parser = new DiffParser(text);
        var result = parser.parse()[0];
        expect(result.name).toBe("example.cc");
        expect(result.groups.length).toBe(3);
        expect(result.groups[0].length).toBe(1);
        expect(result.groups[0][0].type).toBe("header");
        expect(result.groups[0][0].context).toBe(false);
        expect(result.groups[0][0].text).toBe("File deleted");
    });
    it("should show context for one line headers", function() {
        var text =
            "Index: example.cc\n" +
            "diff --git a/example.cc b/example.cc\n" +
            "index aaf..def 100644\n" +
            "--- a/example.cc\n" +
            "+++ b/example.cc\n" +
            "@@ -1,2 +1,1 @@ Context 1\n" +
            " A line of text\n" +
            "- Example line 1\n" +
            "@@ -4,2 +3,1 @@ Context 2\n" +
            " A line of text\n" +
            "- Example line 1\n";
        var parser = new DiffParser(text);
        var result = parser.parse()[0];
        expect(result.name).toBe("example.cc");
        expect(result.groups.length).toBe(7);
        expect(result.groups[0].length).toBe(1);
        expect(result.groups[0][0].type).toBe("header");
        expect(result.groups[0][0].context).toBe(false);
        expect(result.groups[0][0].text).toBe("Context 1");
        expect(result.groups[3].length).toBe(1);
        expect(result.groups[3][0].type).toBe("header");
        expect(result.groups[3][0].context).toBe(true);
        expect(result.groups[3][0].text).toBe("Context 2");
    });
    it("should skip lines with backslash prefixes", function() {
        var text =
            "Index: example.cc\n" +
            "diff --git a/example.cc b/example.cc\n" +
            "index aaf..def 100644\n" +
            "--- a/example.cc\n" +
            "+++ b/example.cc\n" +
            "@@ -1,2 +1,2 @@ Context 1\n" +
            " A line of text\n" +
            "-Example line 1\n" +
            "\\ No newline at end of file\n" +
            "+Example line 2\n";
        var parser = new DiffParser(text);
        var result = parser.parse()[0];
        expect(result.name).toBe("example.cc");
        expect(result.groups.length).toBe(4);
        expect(result.groups[0].length).toBe(1);
        expect(result.groups[0][0].type).toBe("header");
        expect(result.groups[0][0].context).toBe(false);
        expect(result.groups[0][0].text).toBe("Context 1");
        expect(result.groups[2].length).toBe(2);
        expect(result.groups[2][0].type).toBe("remove");
        expect(result.groups[2][0].text).toBe("Example line 1");
        expect(result.groups[2][1].type).toBe("add");
        expect(result.groups[2][1].text).toBe("Example line 2");
    });
});
