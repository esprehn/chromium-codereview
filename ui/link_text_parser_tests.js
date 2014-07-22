
describe("LinkTextParser", function() {
    function expectTokens(text, tokens) {
        var parser = new LinkTextParser(function(text, href) {
            if (!tokens.length)
                throw new Error("Not enough tokens"); 
            var expected = tokens.shift();
            if (typeof expected == "string") {
                expect(href).toBeFalsy();
                expect(text).toBe(expected);
            } else {
                expect(href).toBe(expected.href);
                expect(text).toBe(expected.text);
            }
        });
        parser.parse(text);
    }

    it("should parse plain text", function() {
        expectTokens("This is an issue\nFoo", [
            "This is an issue\nFoo"
        ]);
    });
    it("should parse links", function() {
        expectTokens("abc\n baz http://crbug.com/123 \nfoo bar", [
            "abc\n baz ",
            {href:"http://crbug.com/123", text:"http://crbug.com/123"},
            " \nfoo bar",
        ]);
    });
    it("should parse BUG= lines", function() {
        expectTokens("abc\n baz \nBUG=123 \nfoo bar", [
            "abc\n baz \n",
            "BUG=",
            {href:"http://crbug.com/123", text:"123"},
            "\nfoo bar",
        ]);
    });
    it("should parse links and BUG= lines", function() {
        expectTokens("abc\n http://www.google.com/ baz \nBUG=123 \nfoo bar", [
            "abc\n ",
            {href:"http://www.google.com/", text:"http://www.google.com/"},
            " baz \n",
            "BUG=",
            {href:"http://crbug.com/123", text:"123"},
            "\nfoo bar",
        ]);
    });
});