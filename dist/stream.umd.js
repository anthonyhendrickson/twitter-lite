!(function(e, t) {
  "object" == typeof exports && "undefined" != typeof module
    ? t()
    : "function" == typeof define && define.amd
    ? define(t)
    : t();
})(0, function() {
  var e = (function(e) {
    function t() {
      e.call(this), (this.buffer = "");
    }
    return (
      e && (t.__proto__ = e),
      ((t.prototype = Object.create(e && e.prototype)).constructor = t),
      (t.prototype.parse = function(e) {
        var t, r;
        for (
          this.buffer += e.toString("utf8");
          (t = this.buffer.indexOf("\r\n")) > -1;

        )
          if (
            ((r = this.buffer.slice(0, t)),
            (this.buffer = this.buffer.slice(t + 2)),
            r.length > 0)
          )
            try {
              (r = JSON.parse(r)), this.emit(r.event || "data", r);
            } catch (e) {
              (e.source = r), this.emit("error", e);
            }
          else this.emit("ping");
      }),
      t
    );
  })(require("events"));
  module.exports = e;
});
//# sourceMappingURL=stream.umd.js.map