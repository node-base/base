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
      this.define('registered', {});

      this.options = this.options || {};
      this.cache = this.cache || {};

      if (name) this[name] = {};
      if (typeof config === 'object') {
        this.visit('set', config);
      }
      utils.run(this, 'use', fns);
    },

    /**
     * Set the given `name` on `app._name` and `app.is*` properties. Used for doing
     * lookups in plugins.
     *
     * ```js
     * app.is('foo');
     * console.log(app._name);
     * //=> 'foo'
     * console.log(app.isFoo);
     * //=> true
     * app.is('bar');
     * console.log(app.isFoo);
     * //=> true
     * console.log(app.isBar);
     * //=> true
     * console.log(app._name);
     * //=> 'bar'
     * ```
     * @name .is
     * @param {String} `name`
     * @return {Boolean}
     * @api public
     */

    is: function(name) {
      this.define('is' + name, true);
      this.define('_appname', name);
      this.define('_name', name);
      return this;
    },

    /**
     * Returns true if a plugin has already been registered on an instance.
     *
     * Plugin implementors are encouraged to use this first thing in a plugin
     * to prevent the plugin from being called more than once on the same
     * instance.
     *
     * ```js
     * var base = new Base();
     * base.use(function(app) {
     *   if (app.isRegistered('myPlugin')) return;
     *   // do stuff to `app`
     * });
     * ```
     * @name .isRegistered
     * @emits `plugin` with `registered` and the name of the plugin as arguments.
     * @param {String} `name` The plugin name.
     * @return {Boolean} Returns true when a plugin is already registered.
     * @api public
     */

    isRegistered: function(name) {
      if (this.registered.hasOwnProperty(name)) {
        return true;
      }
      this.emit('plugin', 'registered', name);
      this.registered[name] = true;
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
     * @emits `use` with no arguments.
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
     * Lazily invoke a registered plugin. This can only be used
     * with:
     *
     * 1. plugins that add a single method or property to `app`
     * 2. plugins that do not themselves add a getter/setter property (they're already lazy)
     * 3. plugins that do not return a function
     *
     * ```js
     * app.lazy('store', require('base-store'));
     * ```
     * @name .lazy
     * @param {String} `prop` The name of the property or method added by the plugin.
     * @param {Function} `fn` The plugin function
     * @param {Object} `options` Options to use when the plugin is invoked.
     * @return {Object} Returns the instance for chaining
     * @api public
     */

    lazy: function(prop, fn, opts) {
      this.define(prop, {
        configurable: true,
        set: function(val) {
          this.define(prop, val);
        },
        get: function() {
          this.use(fn(opts));
          return this[prop];
        }
      });
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
     * @emits `set` with `key` and `value` as arguments.
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
     * @emits `get` with `key` and `value` as arguments.
     * @param {String} `key` The name of the property to get. Dot-notation may be used.
     * @return {any} Returns the value of `key`
     * @api public
     */

    get: function(key) {
      key = utils.toPath(arguments);

      var ctx = name ? this[name] : this;
      var val = utils.get(ctx, key);

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
     * @emits `has` with `key` and true or false as arguments.
     * @param {String} `key`
     * @return {Boolean}
     * @api public
     */

    has: function(key) {
      key = utils.toPath(arguments);

      var ctx = name ? this[name] : this;
      var val = utils.get(ctx, key);

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
     * @emits `del` with the `key` as the only argument.
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
     * Define a non-enumerable property on the instance. Dot-notation
     * is **not supported** with `define`.
     *
     * ```js
     * // arbitrary `render` function using lodash `template`
     * define('render', function(str, locals) {
     *   return _.template(str)(locals);
     * });
     * ```
     * @name .define
     * @emits `define` with `key` and `value` as arguments.
     * @param {String} `key` The name of the property to define.
     * @param {any} `value`
     * @return {Object} Returns the instance for chaining.
     * @api public
     */

    define: function(key, val) {
      this.emit('define', key, val);
      utils.define(this, key, val);
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
