
describe("PatchSet", function() {
    it("should sort headers before implementation files", function() {
        var patchset = new PatchSet(new Issue(1), 2);
        patchset.parseData({
            issue: 1,
            patchset: 2,
            files: {
                "Source/rendering/FrameView.h": {},
                "Source/frame/Frame.cpp": {},
                "Source/core/Document.cpp": {},
                "Source/core/DocumentImplementation.h": {},
                "Source/frame/Frame.h": {},
                "Source/rendering/FrameView.cpph": {},
                "Source/rendering/FrameView.cpp": {},
                "public/rendering/FrameView.cpp": {},
                "Source/rendering/FrameView.html": {},
                "Source/core/Document.h": {},
            },
        });
        var fileNames = patchset.files.map(function(file) {
            return file.name;
        });
        expect(fileNames).toEqual([
            "public/rendering/FrameView.cpp",
            "Source/core/Document.h",
            "Source/core/Document.cpp",
            "Source/core/DocumentImplementation.h",
            "Source/frame/Frame.h",
            "Source/frame/Frame.cpp",
            "Source/rendering/FrameView.cpph",
            "Source/rendering/FrameView.h",
            "Source/rendering/FrameView.cpp",
            "Source/rendering/FrameView.html",
        ]);
    });
});
