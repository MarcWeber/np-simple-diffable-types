(function() {
  var by_path, diff_array, diff_deep, type_array_of, type_data, type_object_with_known_keys, type_object_with_known_values, _;

  _ = require("underscore");

  by_path = function() {
    var i, v2, _i, _ref;
    v2 = arguments[0];
    for (i = _i = 1, _ref = arguments.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
      v2 = v2 != null ? v2[arguments[i]] : void 0;
    }
    return v2;
  };

  diff_array = function(a, b, eq) {
    var both, r, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3;
    if (eq == null) {
      eq = (function(a, b) {
        return a === b;
      });
    }
    r = {
      lefts: [],
      both: [],
      rights: []
    };
    for (_i = 0, _len = a.length; _i < _len; _i++) {
      x = a[_i];
      both = false;
      for (_j = 0, _len1 = b.length; _j < _len1; _j++) {
        y = b[_j];
        if (eq(x, y)) {
          r.both.push(x);
          both = true;
          break;
        }
      }
      if (!both) {
        r.lefts.push(x);
      }
    }
    for (_k = 0, _len2 = b.length; _k < _len2; _k++) {
      y = b[_k];
      both = false;
      for (_l = 0, _len3 = a.length; _l < _len3; _l++) {
        x = a[_l];
        if (eq(x, y)) {
          both = true;
          break;
        }
      }
      if (!both) {
        r.rights.push(y);
      }
    }
    return r;
  };

  diff_deep = function(a, b) {
    if (_.isEqual(a, b)) {
      return {
        eq: a
      };
    } else {
      return {
        left: a,
        right: b
      };
    }
  };

  type_data = function(type_options) {
    this.fix = function(v) {};
    this.diff_eq = _.isEqual;
    this.diff = diff_deep;
    this.clean = function(v) {
      return v;
    };
    return this;
  };

  type_array_of = function(type) {
    this.fix = function(v) {};
    this.diff = function(a, b) {
      return diff_array(a, b, type.diff_eq);
    };
    this.clean = function(v) {
      return _.map(v, type.clean);
    };
    return this;
  };

  type_object_with_known_keys = function(type_options) {
    var known_keys;
    known_keys = type_options.known_keys;
    this.fix = function(v) {
      var k, key_opts;
      for (k in known_keys) {
        key_opts = known_keys[k];
        if (v[k] == null) {
          if (key_opts["default"] != null) {
            v[k] = key_opts["default"];
          } else {
            throw "key " + k + " missing ";
          }
        }
        if (v[k] != null) {
          known_keys[k].type.fix(v[k]);
        }
      }
      if (typeof type_options === "function" ? type_options(fix) : void 0) {
        return type_options.fix(v);
      }
    };
    this.diff = function(a, b) {
      var k, r;
      known_keys = type_options.known_keys;
      r = {};
      for (k in known_keys) {
        r[k] = known_keys[k].type.diff(a[k], b[k]);
      }
      return r;
    };
    this.clean = function(v) {
      var k, r;
      r = {};
      for (k in type_options.known_keys) {
        if (v[k] != null) {
          r[k] = type_options[k];
        }
      }
      return r;
    };
    return this;
  };

  type_object_with_known_values = function(type_options) {
    this.fix = function(v) {
      var k, _i, _len, _results;
      _results = [];
      for (v = _i = 0, _len = v.length; _i < _len; v = ++_i) {
        k = v[v];
        _results.push(type_options.type.type_.fix(v));
      }
      return _results;
    };
    this.diff = function(a, b) {
      var d, n, r, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      d = diff_array(_.keys(a), _.keys(b), function(a, b) {
        return a === b;
      });
      r = {
        lefts: {},
        both: {},
        rights: {}
      };
      _ref = d.lefts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        n = _ref[_i];
        r.lefts[n] = a[n];
      }
      _ref1 = d.rights;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        n = _ref1[_j];
        r.rights[n] = b[n];
      }
      _ref2 = d.both;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        n = _ref2[_k];
        r.both[n] = type_options.type.diff(a[n], b[n]);
      }
      return r;
    };
    this.clean = function(v) {
      return v;
    };
    return this;
  };

  module.exports = {
    diff_deep: diff_deep,
    diff_array: diff_array,
    by_path: by_path,
    type_object_with_known_keys: type_object_with_known_keys,
    type_object_with_known_values: type_object_with_known_values,
    type_array_of: type_array_of,
    type_data: type_data
  };

}).call(this);

/*
//@ sourceMappingURL=index.js.map
*/