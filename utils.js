'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils; // eslint-disable-line

/**
 * Lazily required module dependencies
 */

require('arr-union', 'union');
require('cache-base', 'Cache');
require('define-property', 'define');
require('class-utils', 'cu');
require('mixin-deep', 'merge');
require = fn; // eslint-disable-line

/**
 * Run an array of functions by passing each function
 * to a method on the given object specified by the given property.
 *
 * @param  {Object} `obj` Object containing method to use.
 * @param  {String} `prop` Name of the method on the object to use.
 * @param  {Array} `arr` Array of functions to pass to the method.
 */

utils.run = function(obj, prop, arr) {
  var len = arr.length, i = 0;
  while (len--) {
    obj[prop](arr[i++]);
  }
};

utils.pascal = function(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Plugins, should be moved out
 */

utils.namespacePlugin = function namespacePlugin(parent) {
  return function plugin(app) {
    parent = typeof parent === 'string' && parent.length ? parent : false;

    var parentSegs = parent ? parent.split(':') : [];
    var nameSegs = app._name.split(':');
    var namespace = utils.union([], parentSegs, nameSegs);

    app.define('_namespace', namespace.join(':'));
  };
};

/**
 * Plugin that adds `debug` method to the instance
 * and `namespaces` are added to this method.
 *
 * ```js
 * app.debug()('debugging on main namespace')
 * //=> base debugging on main namespace
 *
 * app.debug.one = app.debug('one')
 * app.debug.one('testing %s, whatever', 'foo, bar')
 * //=> base:one testing foo, bar, whatever
 *
 * app.debug.mix = app.debug('two', 123 'three:four', 'five')
 * app.debug.mix('okey, %s awesome', 'this is')
 * //=> base:two:three:four:five okey, this is awesome
 *
 * app.debug.helper('is one of internal namespaces added')
 * //=> base:helper is one of internal namespaces added
 * ```
 *
 * @name   .debug
 * @param  {Array} `namespaces`
 * @return {Function}
 */

utils.debugPlugin = function debugPlugin(namespaces) {
  namespaces = Array.isArray(namespaces) ? namespaces : [namespaces];

  return function plugin(app) {
    app.define('_debugNamespace', app._namespace);
    app.define('debug', function debug() {
      return debugFactory.apply(app, arguments);
    });
    if (namespaces.length) {
      var len = namespaces.length;
      var i = 0;

      while (i < len) {
        var ns = namespaces[i++];
        app.debug[ns] = debugFactory.call(app, ns);
        app.debug[ns].color = app.debug.color;
      }
    }
  };
};

function debugFactory() {
  var app = this;
  var args = [].slice.call(arguments);
  var segs = app._namespace.split(':');
  var len = args.length;
  var i = 0;

  while (i < len) {
    var val = args[i++];
    if (typeof val === 'string') {
      segs.push.apply(segs, val.split(':'));
    }
  }

  return function debug() {
    var fn = require('debug');
    var namespace = segs.join(':');
    app.define('_debugNamespace', namespace);
    fn(namespace).apply(fn, arguments);
    return app;
  };
}

/**
 * Expose `utils` modules
 */

module.exports = utils;
