
function AsyncTest()
{
    var done = false;

    this.wait = function() {
        waitsFor(function() {
            return done;
        });
    };

    this.done = function() {
        done = true;
    };

    this.fail = function(error) {
        done = true;
        throw new Error(error);
    };
}
