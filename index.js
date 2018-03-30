'use strict';

const assert = require('assert');
const typeOf = require('kind-of');
const define = require('define-property');
const pascal = require('pascalcase');
const merge = require('mixin-deep');
const Cache = require('cache-base');

/**
 * Optionally define a custom `cache` namespace to use.
 */

function namespace(name) {
  const fns = [];

  /**
   * Create an instance of `Base` with the given `cache` and `options`.
   * Learn about the [cache object](#cache-object).
   *
   * ```js
   * // initialize with `cache` and `options`
   * const app = new Base({isApp: true}, {abc: true});
   * app.set('foo', 'bar');
   *
   * // values defined with the given `cache` object will be on the root of the instance
   * console.log(app.baz); //=> undefined
   * console.log(app.foo); //=> 'bar'
   * // or use `.get`
   * console.log(app.get('isApp')); //=> true
   * console.log(app.get('foo')); //=> 'bar'
   *
   * // values defined with the given `options` object will be on `app.options
   * console.log(app.options.abc); //=> true
   * ```
   *
   * @name Base
   * @param {Object} `cache` If supplied, this object is passed to [cache-base][] to merge onto the the instance.
   * @param {Object} `options` If supplied, this object is used to initialize the `base.options` object.
   * @api public
   */

  class Base extends Cache {
    constructor(cache, options) {
      super(name, cache);
      this.is('base');
      this.is('app');
      this.options = merge({}, this.options, options);
      this.cache = this.cache || {};
      this.define('registered', {});

      if (fns.length) {
        this.use(fns);
      }
    }

    /**
     * Set the given `name` on `app._name` and `app.is*` properties. Used for doing
     * lookups in plugins.
     *
     * ```js
     * app.is('collection');
     * console.log(app.type);
     * //=> 'collection'
     * console.log(app.isCollection);
     * //=> true
     * ```
     * @name .is
     * @param {String} `name`
     * @return {Boolean}
     * @api public
     */

    is(type) {
      assert.equal(typeof type, 'string', 'expected "type" to be a string');
      if (type !== 'app') delete this.isApp;
      this.define('type', type.toLowerCase());
      this.define('is' + pascal(type), true);
      return this;
    }

    /**
     * Returns true if a plugin has already been registered on an instance.
     *
     * Plugin implementors are encouraged to use this first thing in a plugin
     * to prevent the plugin from being called more than once on the same
     * instance.
     *
     * ```js
     * const base = new Base();
     * base.use(function(app) {
     *   if (app.isRegistered('myPlugin')) return;
     *   // do stuff to `app`
     * });
     *
     * // to also record the plugin as being registered
     * base.use(function(app) {
     *   if (app.isRegistered('myPlugin', true)) return;
     *   // do stuff to `app`
     * });
     * ```
     * @name .isRegistered
     * @emits `plugin` Emits the name of the plugin being registered. Useful for unit tests, to ensure plugins are only registered once.
     * @param {String} `name` The plugin name.
     * @param {Boolean} `register` If the plugin if not already registered, to record it as being registered pass `true` as the second argument.
     * @return {Boolean} Returns true if a plugin is already registered.
     * @api public
     */

    isRegistered(name, register) {
      assert.equal(typeof name, 'string', 'expected name to be a string');
      if (this.registered.hasOwnProperty(name)) {
        return true;
      }
      if (register !== false) {
        this.registered[name] = true;
        this.emit('plugin', name);
      }
      return false;
    }

    /**
     * Call a plugin function or array of plugin functions on the instance. Plugins
     * are called with an instance of base, and options (if defined).
     *
     * ```js
     * const app = new Base()
     *   .use([foo, bar])
     *   .use(baz)
     * ```
     * @name .use
     * @param {String|Function|Array} `name` (optional) plugin name
     * @param {Function|Array} `plugin` plugin function, or array of functions, to call.
     * @param {...rest} Any additional arguments to pass to plugins(s).
     * @return {Object} Returns the item instance for chaining.
     * @api public
     */

    use(...rest) {
      let name = null;
      let fns = null;

      if (typeof rest[0] === 'string') {
        name = rest.shift();
      }

      if (typeof rest[0] === 'function' || Array.isArray(rest[0])) {
        fns = rest.shift();
      }

      if (Array.isArray(fns)) return fns.forEach(fn => this.use(fn, ...rest));
      assert.equal(typeof fns, 'function', 'expected plugin to be a function');

      const key = name;
      if (key && typeof key === 'string' && this.isRegistered(key)) {
        return this;
      }

      fns.call(this, this, ...rest);
      return this;
    }

    /**
     * The `.define` method is used for adding non-enumerable property on the instance.
     * Dot-notation is **not supported** with `define`.
     *
     * ```js
     * // example of a custom arbitrary `render` function created with lodash's `template` method
     * app.define('render', (str, locals) => _.template(str)(locals));
     * ```
     * @name .define
     * @param {String} `key` The name of the property to define.
     * @param {any} `value`
     * @return {Object} Returns the instance for chaining.
     * @api public
     */

    define(key, val) {
      if (typeOf(key) === 'object') {
        return this.visit('define', key);
      }
      define(this, key, val);
      return this;
    }

    /**
     * Getter/setter used when creating nested instances of `Base`, for storing a reference
     * to the first ancestor instance. This works by setting an instance of `Base` on the `parent`
     * property of a "child" instance. The `base` property defaults to the current instance if
     * no `parent` property is defined.
     *
     * ```js
     * // create an instance of `Base`, this is our first ("base") instance
     * const first = new Base();
     * first.foo = 'bar'; // arbitrary property, to make it easier to see what's happening later
     *
     * // create another instance
     * const second = new Base();
     * // create a reference to the first instance (`first`)
     * second.parent = first;
     *
     * // create another instance
     * const third = new Base();
     * // create a reference to the previous instance (`second`)
     * // repeat this pattern every time a "child" instance is created
     * third.parent = second;
     *
     * // we can always access the first instance using the `base` property
     * console.log(first.base.foo);
     * //=> 'bar'
     * console.log(second.base.foo);
     * //=> 'bar'
     * console.log(third.base.foo);
     * //=> 'bar'
     * ```
     * @name .base
     * @api public
     */

    get base() {
      return this.parent ? this.parent.base : this;
    }

    /**
     * Static method for adding global plugin functions that will
     * be added to an instance when created.
     *
     * ```js
     * Base.use(function(app) {
     *   app.foo = 'bar';
     * });
     * const app = new Base();
     * console.log(app.foo);
     * //=> 'bar'
     * ```
     * @name #use
     * @param {Function} `fn` Plugin function to use on each instance.
     * @return {Object} Returns the `Base` constructor for chaining
     * @api public
     */

    static use(fn) {
      assert.equal(typeof fn, 'function', 'expected plugin to be a function');
      fns.push(fn);
      return this;
    }

    /**
     * Delete static mixin method from cache-base, JIT
     */

    static get mixin() {
      return undefined;
    }
  }

  return Base;
}

/**
 * Expose `Base` with default settings
 */

module.exports = namespace();

/**
 * Allow users to define a namespace
 */

module.exports.namespace = namespace;
