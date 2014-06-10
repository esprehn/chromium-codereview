
describe("Search should", function() {
    it("encode url parameters", function() {
        var async = new AsyncTest();
        loadText.expect("/account?limit=10&q=sp%20%3Are", function() {
            return Promise.resolve("");
        });
        runs(function() {
            Search.findUsers("sp :re", "not a number").then(function() {
                async.done();
            }).catch(function(e) {
                async.fail(e);
            });
        });
        async.wait();
    });
    it("pass a default limit", function() {
        var async = new AsyncTest();
        loadText.expect("/account?limit=10&q=esprehn", function() {
            return Promise.resolve("");
        });
        runs(function() {
            Search.findUsers("esprehn").then(function() {
                async.done();
            }).catch(function(e) {
                async.fail(e);
            });
        });
        async.wait();
    });
    it("sort users by email", function() {
        var async = new AsyncTest();
        loadText.expect("/account?limit=10&q=ojan", function() {
            return Promise.resolve("ojan@chromium.org (Ojan)\nesprehn@chromium.org (Elliott)");
        });
        var users;
        runs(function() {
            Search.findUsers("ojan", 10).then(function(value) {
                users = value;
                async.done();
            }).catch(function(e) {
                async.fail(e);
            });
        });
        async.wait();
        runs(function() {
            expect(users).toEqual([
                new User("Elliott", "esprehn@chromium.org", "esprehn"),
                new User("Ojan", "ojan@chromium.org", "ojan"),
            ]);
        });
    });
});
