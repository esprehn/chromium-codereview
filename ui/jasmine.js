
function AsyncTest()
{
    var done = false;

    this.wait = function() {
        waitsFor(function() {
            return done;
        }, 50);
    };

    this.done = function() {
        done = true;
    };

    this.fail = function(error) {
        done = true;
        throw new Error(error);
    };
}
