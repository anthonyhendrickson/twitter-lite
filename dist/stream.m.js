var t = (function(t) {
  function e() {
    t.call(this), (this.buffer = "");
  }
  return (
    t && (e.__proto__ = t),
    ((e.prototype = Object.create(t && t.prototype)).constructor = e),
    (e.prototype.parse = function(t) {
      var e, r;
      for (
        this.buffer += t.toString("utf8");
        (e = this.buffer.indexOf("\r\n")) > -1;

      )
        if (
          ((r = this.buffer.slice(0, e)),
          (this.buffer = this.buffer.slice(e + 2)),
          r.length > 0)
        )
          try {
            (r = JSON.parse(r)), this.emit(r.event || "data", r);
          } catch (t) {
            (t.source = r), this.emit("error", t);
          }
        else this.emit("ping");
    }),
    e
  );
})(require("events"));
module.exports = t;
//# sourceMappingURL=stream.m.js.map