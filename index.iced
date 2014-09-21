_ = require("underscore")

# a type is something which can check or diff a value
# .fix: may add default values, check that mandatory keys are there and such
# .diff: may return {'eq' : value} or {'left': ..., 'right': ...}  if both
# .diff_eq: 
# .clean: return a copy only containing the "known" keys, result might still contain some shared objects
# values are different or {'lefts': .., 'both': .., 'rights': ..} for arrays

##### utls

# access by path or index chain, eg by_path({'key': {'subkey': 7}}, "key", "subkey")
by_path = () ->
  v2 = arguments[0]
  for i in [1...arguments.length]
    v2 = v2?[arguments[i]]
  v2

diff_array = (a, b, eq) ->
  eq = ((a,b) -> a == b) unless eq?
  r =
    lefts: []
    both: []
    rights: []
  for x in a
    both = false
    for y in b
      if eq(x, y)
        r.both.push(x)
        both = true
        break
    r.lefts.push(x) unless both

  # performance could be improved
  for y in b
    both = false
    for x in a
      if eq(x, y)
        both = true
        break
    r.rights.push(y) unless both
  r

diff_deep = (a,b) ->
  if (_.isEqual(a,b)) then eq: a else left: a, right: b

type_data = (type_options) ->
  this.fix = (v) ->
  this.diff_eq = _.isEqual
  this.diff = diff_deep
  this.clean = (v) -> v
  this

type_array_of = (type) ->
  this.fix = (v) ->
  this.diff = (a,b) -> diff_array(a, b, type.diff_eq)
  this.clean = (v) -> _.map(v, type.clean)
  this

type_object_with_known_keys = (type_options) ->
  known_keys = type_options.known_keys
  # checks and fixes
  this.fix = (v) ->
    for k,key_opts of known_keys
      if (!v[k]?)
        if key_opts.default?
          v[k] = key_opts.default
        else
          throw "key " + k + " missing " # unless key_opts?optional
      known_keys[k].type.fix(v[k]) if v[k]?
    type_options.fix(v) if type_options?fix

  this.diff = (a, b) ->
    known_keys = type_options.known_keys
    r = {}
    for k of known_keys
      r[k] = known_keys[k].type.diff(a[k], b[k])
    r

  this.clean = (v) ->
    r = {}
    for k of type_options.known_keys
      if v[k]?
        r[k] = type_options[k]
    r
  this

type_object_with_known_values = (type_options) ->
  this.fix = (v) ->
    for k,v in v
      type_options.type.type_.fix(v)
  this.diff = (a,b) ->
    d = diff_array(_.keys(a), _.keys(b), (a,b) -> a == b)
    r =
      lefts: {}
      both: {}
      rights: {}
    for n in d.lefts
      r.lefts[n] = a[n]
    for n in d.rights
      r.rights[n] = b[n]
    for n in d.both
      r.both[n] = type_options.type.diff(a[n], b[n])
    r
  this.clean = (v) -> v
  this

module.exports =
  # utils
  
  # diffs using _.isEqual, return {eq: ..} or {left .., right: }
  diff_deep: diff_deep   

  # diff_array(l,r,eq), returns {lefts: ... , both: .., rights: ...}
  diff_array: diff_array

  # accesses deep properties easily
  by_path:  by_path

  # types
  type_object_with_known_keys: type_object_with_known_keys
  type_object_with_known_values: type_object_with_known_values
  type_array_of: type_array_of
  type_data: type_data
