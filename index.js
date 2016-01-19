'use strict';

function namespace(name) {
  var Emitter = require('component-emitter');
  var utils = require('./utils');
  var fns = [];

  /**
   * Create an instance of `Base` with `options`.
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

  function Base(config) {
    if (!(this instanceof Base)) {
      return new Base(config);
    }
    this.initBase(config);
  }

  /**
   * Prototype methods
   */

  Base.prototype = Emitter({
    constructor: Base,

    /**
     * Initialize `Base` defaults with the given `config` object
     */

    initBase: function(config) {
      this.define('_callbacks', this._callbacks);
      this.define('_isRegistered', {});

      this.options = this.options || {};
      this.cache = this.cache || {};

      if (name) this[name] = {};
      if (typeof config === 'object') {
        this.visit('set', config);
      }
      utils.run(this, 'use', fns);
    },

    /**
     * Convenience method for assigning a `name` on the instance
     * for doing lookups in plugins.
     */

    is: function(name) {
      this.define('is' + name, true);
      this.define('_name', name);
      return this;
    },

    /**
     * Returns true if a plugin has already been registered on an instance.
     * This is optionally used by plugin implementors to prevent plugins
     * from being called on an instanced more than once.
     *
     * ```js
     * var base = new Base();
     * base.use(function(app) {
     *   if (app.isRegistered('myPlugin')) {
     *     return;
     *   }
     *   // do stuff
     * });
     * ```
     * @name .isRegistered
     * @param {String} `name` The plugin name.
     * @return {Boolean} Returns true when a plugin is already registered.
     * @api public
     */

    isRegistered: function(name) {
      if (this._isRegistered.hasOwnProperty(name)) {
        return true;
      }
      this._isRegistered[name] = true;
      return false;
    },

    /**
     * Define a plugin function to be called immediately upon init.
     * Plugins are chainable and the only parameter exposed to the
     * plugin is the application instance.
     *
     * ```js
     * var app = new Base()
     *   .use(foo)
     *   .use(bar)
     *   .use(baz)
     * ```
     * @name .use
     * @param {Function} `fn` plugin function to call
     * @return {Object} Returns the item instance for chaining.
     * @api public
     */

    use: function(fn) {
      fn.call(this, this);
      this.emit('use');
      return this;
    },

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
     * @param {any} `value`
     * @return {Object} Returns the instance for chaining.
     * @api public
     */

    set: function(key, val) {
      if (Array.isArray(key) && arguments.length === 2) {
        key = utils.toPath(key);
      }
      if (typeof key === 'object') {
        this.visit('set', key);
      } else {
        utils.set(name ? this[name] : this, key, val);
        this.emit('set', key, val);
      }
      return this;
    },

    /**
     * Return the stored value of `key`. Dot notation may be used
     * to get [nested property values][get-value].
     *
     * ```js
     * app.set('a.b.c', 'd');
     * app.get('a.b');
     * //=> {c: 'd'}
     *
     * app.get(['a', 'b']);
     * //=> {c: 'd'}
     * ```
     *
     * @name .get
     * @param {any} `key`
     * @return {any}
     * @api public
     */

    get: function(key) {
      key = utils.toPath(arguments);
      var val = name
        ? utils.get(this[name], key)
        : utils.get(this, key);

      this.emit('get', key, val);
      return val;
    },

    /**
     * Return true if app has a stored value for `key`,
     * false only if `typeof` value is `undefined`.
     *
     * ```js
     * app.set('foo', 'bar');
     * app.has('foo');
     * //=> true
     * ```
     *
     * @name .has
     * @param {any} `key`
     * @return {any}
     * @api public
     */

    has: function(key) {
      key = utils.toPath(arguments);
      var val = name
        ? utils.get(this[name], key)
        : utils.get(this, key);

      var has = typeof val !== 'undefined';
      this.emit('has', key, has);
      return has;
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

    del: function(key) {
      if (Array.isArray(key)) {
        this.visit('del', key);
      } else {
        utils.del(name ? this[name] : this, key);
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

    define: function(key, value) {
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

    visit: function(method, val) {
      utils.visit(this, method, val);
      return this;
    },

    /**
     * Mix property `key` onto the Base prototype. If base-methods
     * is inherited using `Base.extend` this method will be overridden
     * by a new `mixin` method that will only add properties to the
     * prototype of the inheriting application.
     *
     * @name .mixin
     * @param {String} `key`
     * @param {Object|Array} `val`
     * @return {Object} Returns the instance for chaining.
     * @api public
     */

    mixin: function(key, val) {
      Base.prototype[key] = val;
      return this;
    }
  });

  /**
   * Static method for adding global plugin functions that will
   * be added to an instance when created.
   *
   * ```js
   * Base.use(function(app) {
   *   app.foo = 'bar';
   * });
   * var app = new Base();
   * console.log(app.foo);
   * //=> 'bar'
   * ```
   *
   * @param  {Function} `fn` Plugin function to use on each instance.
   * @api public
   */

  Base.use = function(fn) {
    fns.push(fn);
  };

  /**
   * Static method for inheriting both the prototype and
   * static methods of the `Base` class. See [class-utils][]
   * for more details.
   *
   * @api public
   */

  Base.extend = utils.cu.extend(Base, function(Ctor, Parent) {
    Ctor.prototype.mixins = [];
    Ctor.mixin = function(fn) {
      var mixin = fn(Ctor.prototype, Ctor);
      if (typeof mixin === 'function') {
        Ctor.prototype.mixins.push(mixin);
      }
    };

    Ctor.prototype.mixin = function(key, value) {
      Ctor.prototype[key] = value;
    };

    Ctor.mixins = function(Child) {
      utils.run(Child, 'mixin', Ctor.prototype.mixins);
    };
  });

  /**
   * Static method for adding mixins to the prototype.
   * When a function is returned from the mixin plugin, it will be added to
   * an array so it can be used on inheriting classes via `Base.mixins(Child)`.
   *
   * ```js
   * Base.mixin(function fn(proto) {
   *   proto.foo = function(msg) {
   *     return 'foo ' + msg;
   *   };
   *   return fn;
   * });
   * ```
   *
   * @param  {Function} `fn` Function to call
   * @api public
   * @name  Base.mixin
   */

  Base.prototype.mixins = Base.prototype.mixins || [];
  Base.mixin = function(fn) {
    var mixin = fn(Base.prototype, Base);
    if (typeof mixin === 'function') {
      Base.prototype.mixins.push(mixin);
    }
  };

  /**
   * Static method for running currently saved global mixin functions against a child constructor.
   *
   * ```js
   * Base.extend(Child);
   * Base.mixins(Child);
   * ```
   *
   * @param  {Function} `Child` Constructor function of a child class
   * @api public
   * @name  Base.mixins
   */

  Base.mixins = function(Child) {
    utils.run(Child, 'mixin', Base.prototype.mixins);
  };

  /**
   * Similar to `util.inherit`, but copies all static properties,
   * prototype properties, and descriptors from `Provider` to `Receiver`.
   * [class-utils][] for more details.
   *
   * @api public
   */

  Base.inherit = utils.cu.inherit;
  return Base;
}

/**
 * Expose `base-methods`
 */

module.exports = namespace();

/**
 * Allow users to define a namespace
 */

module.exports.namespace = namespace;
