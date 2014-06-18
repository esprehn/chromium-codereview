
describe("TryJobResult", function() {
    function createData() {
        return {
            parent_name: null,
            tests: [ ],
            slave: null,
            url: null,
            timestamp: "2014-06-18 08:13:29.036400",
            builder: "win_blink_oilpan_rel",
            clobber: true,
            project: "project name",
            reason: "some reason",
            master: "tryserver.blink",
            result: 6, // Pending
            key: "xyz",
            requester: "esprehn@chromium.org",
            buildnumber: 123,
            revision: "HEAD"
        };
    }

    it("should parse basic daata", function() {
        var tryResult = new TryJobResult();
        var data = createData();
        tryResult.parseData(data);
        expect(tryResult.timestamp).toEqual(Date.utc.create(data.timestamp));
        expect(tryResult.builder).toBe("win_blink_oilpan_rel");
        expect(tryResult.clobber).toBe(true);
        expect(tryResult.project).toBe("project name");
        expect(tryResult.reason).toBe("some reason");
        expect(tryResult.result).toBe("pending");
        expect(tryResult.revision).toBe("HEAD");
        expect(tryResult.buildnumber).toBe(123);
    });
    it("should convert results ids to names", function() {
        var data = createData();
        Object.keys(TryJobResult.RESULT, function(id, name) {
            var tryResult = new TryJobResult();
            data.result = parseInt(id, 10);
            tryResult.parseData(data);
            expect(tryResult.result).toBe(name);
        });
    });
    it("should handle triggered tests", function() {
        var tryResult = new TryJobResult();
        var data = createData();
        data.builder = "cros_daisy_triggered_tests";
        data.master = "tryserver.chromium";
        tryResult.parseData(data);
        expect(tryResult.getServerName()).toBe(data.master);
    });
});
