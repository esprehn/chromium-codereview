
describe("Search should", function() {
  it("sort users by email", function() {
    loadText.expect("/account?limit=10&q=ojan", function() {
        return Promise.resolve("ojan@chromium.org (Ojan)\nesprehn@chromium.org (Elliott)");
    });
    var users;
    var async = new AsyncTest();
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
