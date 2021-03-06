(function() {
  var arangodb_scheme, arangodb_scheme_collection, chai, expect, sdt;

  chai = require('chai');

  chai.config.showDiff = true;

  chai.config.includeStack = true;

  chai.config.truncateThreshold = 0;

  expect = chai.expect;

  sdt = require('simple-diffable-types');

  arangodb_scheme_collection = new sdt.type_object_with_known_keys({
    known_keys: {
      indexes: {
        type: sdt.type_array_of(new sdt.type_data)
      }
    }
  });

  arangodb_scheme = new sdt.type_object_with_known_keys({
    known_keys: {
      collections: {
        type: new sdt.type_object_with_known_values({
          type: arangodb_scheme_collection
        })
      }
    }
  });

  describe('by_path', function() {
    var d;
    d = {
      a: {
        b: 8
      }
    };
    it("should return value", function() {
      return expect(sdt.by_path(d, 'a', 'b')).to.eq(8);
    });
    return it("should return undefined if path doesn't exist", function() {
      return expect(sdt.by_path(d, 'z', 'b')).to.be.an('undefined');
    });
  });

  describe('diff_deep', function() {
    it("should return left right keys if a differs from b", function() {
      return expect(sdt.diff_deep(2, 3)).to.deep.eq({
        left: 2,
        right: 3
      });
    });
    return it("should return eq if a is deep equal to b", function() {
      return expect(sdt.diff_deep([2], [2])).to.deep.eq({
        eq: [2]
      });
    });
  });

  describe("diff_array", function() {
    return it("should diff", function() {
      var a, b;
      a = [1, 2];
      b = [2, 3];
      return expect(sdt.diff_array(a, b)).to.eql({
        lefts: [1],
        both: [2],
        rights: [3]
      });
    });
  });

  describe("type_object_with_known_keys", function() {
    var d1, d2, t_with_default;
    t_with_default = new sdt.type_object_with_known_keys({
      known_keys: {
        key1: {
          type: new sdt.type_data({
            "default": 0
          })
        }
      }
    });
    d1 = {
      key1: 1
    };
    d2 = {
      key1: 2
    };
    it("should diff", function() {
      return expect(t_with_default.diff(d1, d2)).to.deep.eq({
        key1: {
          left: 1,
          right: 2
        }
      });
    });
    it("should return eq if values are the same", function() {
      return expect(t_with_default.diff(d1, d1)).to.deep.eq({
        key1: {
          eq: 1
        }
      });
    });
    it("t_with_default sets key1 to default value", function() {
      var d_bad;
      d_bad = {};
      t_with_default.fix(d_bad);
      return expect(d_bad).to.have.deep.property('key1', 0);
    });
    return it("should clean", function() {
      var d3;
      d3 = {
        key1: "abc",
        key2: "to be cleaned"
      };
      return expect(t_with_default.clean(d3)).to.not.have.deep.property('key2');
    });
  });

  describe("type_object_with_known_values", function() {
    var d1, d2, t;
    t = new sdt.type_object_with_known_values({
      type: new sdt.type_data
    });
    d1 = {
      k1: 1,
      k2: 2
    };
    d2 = {
      k2: 2,
      k3: 3
    };
    it("should find the differences", function() {
      return expect(t.diff(d1, d2)).to.deep.eq({
        both: {
          "k2": {
            "eq": 2
          }
        },
        lefts: {
          "k1": 1
        },
        rights: {
          "k3": 3
        }
      });
    });
    return it("should set defaults", function() {
      var d, t_with_default;
      t_with_default = new sdt.type_object_with_known_keys({
        known_keys: {
          key: {
            type: sdt.type_data({
              "default": 13
            })
          }
        }
      });
      t = new sdt.type_object_with_known_values({
        type: t_with_default
      });
      d = {
        any_key: {}
      };
      t.fix(d);
      return expect(d).to.deep.eq({
        any_key: {
          key: 13
        }
      });
    });
  });

  describe("nested cases", function() {
    return it("type_object_with_known_keys -> type_array_of should add default empty array as key", function() {
      var d, db, type_collection, type_collections, type_database, type_index;
      type_index = function() {
        return this.fix = function(v) {
          if (v.type == null) {
            throw "type missing";
          }
        };
      };
      type_collection = new sdt.type_object_with_known_keys({
        known_keys: {
          indexes: {
            type: sdt.type_array_of(type_index)
          }
        }
      });
      d = {};
      type_collection.fix(d);
      expect(d).to.deep.eq({
        indexes: []
      });
      type_collections = new sdt.type_object_with_known_values({
        type: type_collection
      });
      type_database = new sdt.type_object_with_known_keys({
        known_keys: {
          collections: {
            type: type_collections
          }
        }
      });
      db = {
        collections: {
          x: {}
        }
      };
      type_database.fix(db);
      return expect(db).to.deep.eq({
        collections: {
          x: {
            indexes: []
          }
        }
      });
    });
  });

}).call(this);

/*
//@ sourceMappingURL=test-test.js.map
*/