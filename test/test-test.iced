chai = require('chai')
chai.config.showDiff = true
chai.config.includeStack = true
chai.config.truncateThreshold = 0
expect = chai.expect

sdt = require('simple-diffable-types')

arangodb_scheme_collection = new sdt.type_object_with_known_keys
  known_keys:
    indexes:
      type: sdt.type_array_of new sdt.type_data

arangodb_scheme = new sdt.type_object_with_known_keys
  known_keys:
    collections:
      type: new sdt.type_object_with_known_values(
        type: arangodb_scheme_collection
      )

# testing utility functions
describe 'by_path', ->
  d =
    a:
      b: 8
  it "should return value", ->
    expect(sdt.by_path(d, 'a', 'b')).to.eq(8)

  it "should return undefined if path doesn't exist", ->
    expect(sdt.by_path(d, 'z', 'b')).to.be.an('undefined')

describe 'diff_deep', ->
  it "should return left right keys if a differs from b", ->
    expect(sdt.diff_deep(2,3)).to.deep.eq(left: 2, right: 3)

  it "should return eq if a is deep equal to b", ->
    expect(sdt.diff_deep([2],[2])).to.deep.eq(eq: [2])



# testing diff_array
describe "diff_array", ->
  it "should diff", ->
    a = [1,2]
    b = [2,3]
    expect(sdt.diff_array(a,b)).to.eql( {lefts: [1], both: [2], rights:[3]} )



describe "type_object_with_known_keys", ->

  t_with_default = new sdt.type_object_with_known_keys(
    known_keys:
      key1:
        type: new sdt.type_data(default: 0)
  )

  d1 =
    key1: 1
  d2 =
    key1: 2

  it "should diff", ->
    expect(t_with_default.diff(d1, d2)).to.deep.eq({ key1: { left: 1, right: 2 } })

  it "should return eq if values are the same", ->
    expect(t_with_default.diff(d1, d1)).to.deep.eq({ key1: { eq: 1 }})

  it "t_with_default sets key1 to default value", ->
    d_bad = {}
    t_with_default.fix(d_bad)
    expect(d_bad).to.have.deep.property('key1', 0)


  it "should clean", ->
    d3 =
      key1: "abc"
      key2: "to be cleaned"

    expect(t_with_default.clean(d3)).to.not.have.deep.property('key2')

# testing type_object_with_known_keys
describe "type_object_with_known_values", ->
  t = new sdt.type_object_with_known_values(
    type: new sdt.type_data
  )

  d1 =
    k1: 1
    k2: 2

  d2 =
    k2: 2
    k3: 3

  it "should find the differences", ->
    expect(t.diff(d1, d2)).to.deep.eq(
        both: { "k2": { "eq": 2 } }
        lefts: { "k1": 1 }
        rights: { "k3": 3 }
    )

  it "should set defaults", ->
    t_with_default = new sdt.type_object_with_known_keys
      known_keys:
        key:
          type: sdt.type_data(default: 13)

    t = new sdt.type_object_with_known_values(type: t_with_default)
    d = any_key: {}
    t.fix(d)
    expect(d).to.deep.eq(any_key: key: 13)

describe "nested cases", ->
  it "type_object_with_known_keys -> type_array_of should add default empty array as key", ->
    type_index = ->
      this.fix = (v) ->
        throw "type missing" unless v.type?

    type_collection = new sdt.type_object_with_known_keys
      known_keys:
        indexes:
          type: sdt.type_array_of type_index

    d = {}
    type_collection.fix(d)
    expect(d).to.deep.eq(indexes: [])

    type_collections = new sdt.type_object_with_known_values(
      type: type_collection
    )

    type_database = new sdt.type_object_with_known_keys
      known_keys:
        collections:
          type: type_collections

    db =
      collections:
        x: {}
    type_database.fix(db)
    expect(db).to.deep.eq(collections: x: indexes: [])

# describe "test that tests get run", ->
#   it "should fail", ->
#     expect(2).to.eq(3)
