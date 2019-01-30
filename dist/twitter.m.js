var e = require("crypto"),
  t = require("oauth-1.0a"),
  r = require("cross-fetch"),
  n = require("querystring"),
  s = require("./stream"),
  o = function(e, t) {
    return void 0 === t && (t = "1.1"), "https://" + e + ".twitter.com/" + t;
  },
  i = {
    subdomain: "api",
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,
    bearer_token: null
  },
  u = [
    "direct_messages/events/new",
    "direct_messages/welcome_messages/new",
    "direct_messages/welcome_messages/rules/new",
    "collections/entries/curate"
  ],
  a = { "Content-Type": "application/json", Accept: "application/json" };
function c(e) {
  return e
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}
var h = function(r) {
  var n,
    s = Object.assign({}, i, r);
  (this.authType = s.bearer_token ? "App" : "User"),
    (this.client = t({
      consumer: {
        key: (n = { key: s.consumer_key, secret: s.consumer_secret }).key,
        secret: n.secret
      },
      signature_method: "HMAC-SHA1",
      hash_function: function(t, r) {
        return e
          .createHmac("sha1", r)
          .update(t)
          .digest("base64");
      }
    })),
    (this.token = { key: s.access_token_key, secret: s.access_token_secret }),
    (this.url = o(s.subdomain)),
    (this.oauth = o(s.subdomain, "oauth")),
    (this.config = s);
};
(h._handleResponse = function(e) {
  var t = e.headers.raw();
  return 204 === e.status
    ? { _headers: t }
    : e.json().then(function(e) {
        return (e._headers = t), e;
      });
}),
  (h.prototype.getBearerToken = function() {
    return new Promise(
      function(e, t) {
        var n;
        return (
          (n = {
            Authorization:
              "Basic " +
              Buffer.from(
                this.config.consumer_key + ":" + this.config.consumer_secret
              ).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          }),
          r("https://api.twitter.com/oauth2/token", {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: n
          })
            .then(h._handleResponse)
            .then(function(r) {
              try {
                return e(r);
              } catch (e) {
                return t(e);
              }
            }, t)
        );
      }.bind(this)
    );
  }),
  (h.prototype.getRequestToken = function(e) {
    return new Promise(
      function(t, s) {
        var o, i, u;
        return (
          (o = { url: this.oauth + "/request_token", method: "POST" }),
          (i = {}),
          e && (i = { oauth_callback: e }),
          i && (o.url += "?" + n.stringify(i)),
          (u = this.client.toHeader(this.client.authorize(o, {}))),
          r(o.url, { method: "POST", headers: Object.assign({}, a, u) })
            .then(function(e) {
              return e.text();
            })
            .then(function(e) {
              return n.parse(e);
            })
            .then(function(e) {
              try {
                return t(e);
              } catch (e) {
                return s(e);
              }
            }, s)
        );
      }.bind(this)
    );
  }),
  (h.prototype.getAccessToken = function(e) {
    return new Promise(
      function(t, s) {
        var o, i, u;
        return (
          (o = { url: this.oauth + "/access_token", method: "POST" }),
          (i = { oauth_verifier: e.verifier }) &&
            (o.url += "?" + n.stringify(i)),
          (u = this.client.toHeader(
            this.client.authorize(o, { key: e.key, secret: e.secret })
          )),
          r(o.url, { method: "POST", headers: Object.assign({}, a, u) })
            .then(function(e) {
              return e.text();
            })
            .then(function(e) {
              return n.parse(e);
            })
            .then(function(e) {
              try {
                return t(e);
              } catch (e) {
                return s(e);
              }
            }, s)
        );
      }.bind(this)
    );
  }),
  (h.prototype._makeRequest = function(e, t, r) {
    var s = { url: this.url + "/" + t + ".json", method: e };
    r && ("POST" === e ? (s.data = r) : (s.url += "?" + n.stringify(r)));
    return {
      requestData: s,
      headers:
        "User" === this.authType
          ? this.client.toHeader(this.client.authorize(s, this.token))
          : { Authorization: "Bearer " + this.config.bearer_token }
    };
  }),
  (h.prototype.get = function(e, t) {
    var n = this._makeRequest("GET", e, t);
    return r(n.requestData.url, { headers: n.headers })
      .then(h._handleResponse)
      .then(function(e) {
        return "errors" in e ? Promise.reject(e) : e;
      });
  }),
  (h.prototype.post = function(e, t) {
    var s = this._makeRequest("POST", e, u.includes(e) ? null : t),
      o = s.requestData,
      i = Object.assign({}, a, s.headers);
    return (
      u.includes(e)
        ? (t = JSON.stringify(t))
        : ((t = n.stringify(t)),
          (i["Content-Type"] = "application/x-www-form-urlencoded")),
      r(o.url, { method: "POST", headers: i, body: c(t) })
        .then(h._handleResponse)
        .then(function(e) {
          return "errors" in e ? Promise.reject(e) : e;
        })
    );
  }),
  (h.prototype.stream = function(e, t) {
    var i = this;
    if ("User" !== this.authType)
      throw new Error("Streams require user context authentication");
    var u = new s(),
      a = { url: o("stream") + "/" + e + ".json", method: "POST" };
    t && (a.data = t);
    var h = this.client.toHeader(this.client.authorize(a, this.token));
    return (
      r(a.url, {
        method: "POST",
        headers: Object.assign({}, h, {
          "Content-Type": "application/x-www-form-urlencoded"
        }),
        body: c(n.stringify(t))
      })
        .then(function(e) {
          (u.destroy = i.stream.destroy = function() {
            return e.body.destroy();
          }),
            200 === e.status
              ? u.emit("start", e)
              : u.emit("error", Error("Status Code: " + e.status)),
            e.body
              .on("data", function(e) {
                return u.parse(e);
              })
              .on("error", function(e) {
                return u.emit("error", e);
              })
              .on("end", function() {
                return u.emit("end", e);
              });
        })
        .catch(function(e) {
          return u.emit("error", e);
        }),
      u
    );
  }),
  (module.exports = h);
//# sourceMappingURL=twitter.m.js.map
