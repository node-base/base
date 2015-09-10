'use strict';

var util = require('util');
var Emitter = require('component-emitter');
var utils = require('./utils');

/**
 * Create an instance of `Base` with optional `options`.
 *
 * ```js
 * var app = new Base();
 * app.set('foo', 'bar');
 * console.log(app.get('foo'));
 * //=> 'bar'
 * ```
 *
 * @param {Object} `options`
 * @api public
 */

function Base(options) {
  if (!(this instanceof Base)) {
    return new Base(options);
  }
  Emitter.call(this);
  this.define('_callbacks', this._callbacks);
  if (typeof options === 'object') {
    this.visit('set', options);
  }
}

Base.prototype = Emitter({
  constructor: Base,

  /**
   * Assign `value` to `key`. Also emits `set` with
   * the key and value.
   *
   * ```js
   * app.on('set', function(key, val) {
   *   // do something when `set` is emitted
   * });
   *
   * app.set(key, value);
   *
   * // also takes an object or array
   * app.set({name: 'Halle'});
   * app.set([{foo: 'bar'}, {baz: 'quux'}]);
   * console.log(app);
   * //=> {name: 'Halle', foo: 'bar', baz: 'quux'}
   * ```
   *
   * @name .set
   * @param {String} `key`
   * @param {*} `value`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  set: function (key, val) {
    if (typeof key === 'object') {
      this.visit('set', key);
    } else {
      utils.set(this, key, val);
      this.emit('set', key, val);
    }
    return this;
  },

  /**
   * Return the stored value of `key`. Dot notation may be used
   * to get [nested property values][get-value].
   *
   * ```js
   * app.set('foo', 'bar');
   * app.get('foo');
   * // => "bar"
   * ```
   *
   * @name .get
   * @param {*} `key`
   * @param {Boolean} `escape`
   * @return {*}
   * @api public
   */

  get: function (key) {
    return utils.get(this, key);
  },

  /**
   * Delete `key` from the instance. Also emits `del` with
   * the key of the deleted item.
   *
   * ```js
   * app.del(); // delete all
   * // or
   * app.del('foo');
   * // or
   * app.del(['foo', 'bar']);
   * ```
   * @name .del
   * @param {String} `key`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  del: function (key) {
    if (typeof key === 'object') {
      this.visit('del', key);
    } else {
      utils.del(this, key);
      this.emit('del', key);
    }
    return this;
  },

  /**
   * Define a non-enumerable property on the instance.
   *
   * ```js
   * // arbitrary `render` function using lodash `template`
   * define('render', function(str, locals) {
   *   return _.template(str)(locals);
   * });
   * ```
   * @name .define
   * @param {String} `key`
   * @param {any} `value`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  define: function (key, value) {
    utils.define(this, key, value);
    return this;
  },

  /**
   * Visit `method` over the items in the given object, or map
   * visit over the objects in an array.
   *
   * @name .visit
   * @param {String} `method`
   * @param {Object|Array} `val`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  visit: function (method, val) {
    utils.visit(this, method, val);
    return this;
  }
});

/**
 * Static method for inheriting both the prototype and
 * static methods of the `Base` class.
 *
 * ```js
 * function MyApp(options) {
 *   Base.call(this, options);
 * }
 * Base.extend(MyApp);
 *
 *
 * // Optionally pass another object to extend onto `MyApp`
 * function MyApp(options) {
 *   Base.call(this, options);
 *   Foo.call(this, options);
 * }
 * Base.extend(MyApp, Foo.prototype);
 * ```
 *
 * @param {Function} `Ctor` The constructor to extend.
 * @param {Object} `proto` Optionally pass an object of methods to extend the prototype.
 * @api public
 */

Base.extend = function (Ctor, proto) {
  util.inherits(Ctor, Base);

  for (var key in Base) {
    Ctor[key] = Base[key];
  }

  if (typeof proto === 'object') {
    var obj = Object.create(proto);

    for (var k in obj) {
      Ctor.prototype[k] = obj[k];
    }
  }
};

/**
 * Similar to `util.inherit`, but copies all properties
 * and descriptors from `Provider` to `Receiver`
 *
 * ```js
 * Base.inherit(MyClass, OtherClass);
 * ```
 *
 * @param {Function} `Receiver` Constructor to extend
 * @param {Function} `Provider`
 * @api public
 */

Base.inherit = utils.inherit;

/**
 * Expose `Base`
 */

module.exports = Base;