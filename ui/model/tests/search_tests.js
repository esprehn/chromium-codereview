"use strict";

describe("Search", function() {
    asyncIt("should encode url parameters", function() {
        loadText.expect("/account?limit=10&q=sp%20%3Are", function() {
            return Promise.resolve("");
        });
        return Search.findUsers("sp :re", "not a number");
    });
    asyncIt("should pass a default limit", function() {
        loadText.expect("/account?limit=10&q=esprehn", function() {
            return Promise.resolve("");
        });
        return Search.findUsers("esprehn");
    });
    asyncIt("should sort users by email", function() {
        loadText.expect("/account?limit=10&q=ojan", function() {
            return Promise.resolve("ojan@chromium.org (Ojan)\nesprehn@chromium.org (Elliott)");
        });
        return Search.findUsers("ojan", 10).then(function(users) {
            expect(users).toEqual([
                new User("Elliott", "esprehn@chromium.org", "esprehn"),
                new User("Ojan", "ojan@chromium.org", "ojan"),
            ]);
        });
    });
});
