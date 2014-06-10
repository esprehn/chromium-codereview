
describe("PatchFile should", function() {
  it("only parse positive or zero delta numbers", function() {
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
