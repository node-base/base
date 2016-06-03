# base [![NPM version](https://img.shields.io/npm/v/base.svg?style=flat)](https://www.npmjs.com/package/base) [![NPM downloads](https://img.shields.io/npm/dm/base.svg?style=flat)](https://npmjs.org/package/base) [![Build Status](https://img.shields.io/travis/node-base/base.svg?style=flat)](https://travis-ci.org/node-base/base)

base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting with a handful of common methods, like `set`, `get`, `del` and `use`.

## What is Base?

Base is a framework for rapidly creating node.js applications, with a handful of commonly needed methods, like `.set`, `.get` and `.has`, and a plugin system and conventions that make it easy to extend your application with custom code written in pure JavaScript.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install base --save
```

## Usage

```js
var base = require('base');
```

**inherit**

```js
function App() {
  base.call(this);
}
base.extend(App);

var app = new App();
app.set('a', 'b');
app.get('a');
//=> 'b';
```

**instantiate**

```js
var app = base();
app.set('foo', 'bar');
console.log(app.foo);
//=> 'bar'
```

**Inherit or instantiate with a namespace**

By default, the `.get`, `.set` and `.has` methods set and get values from the root of the `base` instance. You can customize this using the `.namespace` method exposed on the exported function. For example:

```js
var Base = require('base');
// get and set values on the `base.cache` object
var base = Base.namespace('cache');

var app = base();
app.set('foo', 'bar');
console.log(app.cache.foo);
//=> 'bar'
```

## API

### [Base](index.js#L40)

Create an instance of `Base` with `config` and `options`.

**Params**

* `config` **{Object}**: passed to [cache-base](https://github.com/jonschlinkert/cache-base)
* `options` **{Object}**

**Example**

```js
var app = new Base({baz: 'qux'}, {yeah: 123, nope: 456});

app.set('foo', 'bar');

console.log(app.get('foo')); //=> 'bar'
console.log(app.get('baz')); //=> 'qux'
console.log(app.get('yeah')); //=> undefined

console.log(app.foo); //=> 'bar'
console.log(app.baz); //=> 'qux'
console.log(app.yeah); //=> undefined

console.log(app.options.yeah); //=> 123
console.log(app.options.nope); //=> 456
```

### [.base](index.js#L98)

Getter/setter for exposing a `base` (shared) instance of `base` applications.

This property only works when a "parent" instance is created on `app`.
If `app.parent` is defined, the `app.base` getter ensures that the `base`
instance is always the very first instance.

**Example**

```js
var a = new Base();
a.foo = 'bar';

var b = new Base();
b.parent = a;

var c = new Base();
c.parent = b;

console.log(c.foo);
//=> undefined
console.log(c.base.foo);
//=> 'bar'
```

### [.is](index.js#L137)

Set the given `name` on `app._name` and `app.is*` properties. Used for doing lookups in plugins.

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

**Example**

```js
app.is('foo');
console.log(app._name);
//=> 'foo'
console.log(app.isFoo);
//=> true
app.is('bar');
console.log(app.isFoo);
//=> true
console.log(app.isBar);
//=> true
console.log(app._name);
//=> 'bar'
```

### [.isRegistered](index.js#L175)

Returns true if a plugin has already been registered on an instance.

Plugin implementors are encouraged to use this first thing in a plugin
to prevent the plugin from being called more than once on the same
instance.

**Params**

* `name` **{String}**: The plugin name.
* `register` **{Boolean}**: If the plugin if not already registered, to record it as being registered pass `true` as the second argument.
* `returns` **{Boolean}**: Returns true if a plugin is already registered.

**Events**

* `emits`: `plugin` Emits the name of the plugin.

**Example**

```js
var base = new Base();
base.use(function(app) {
  if (app.isRegistered('myPlugin')) return;
  // do stuff to `app`
});

// to also record the plugin as being registered
base.use(function(app) {
  if (app.isRegistered('myPlugin', true)) return;
  // do stuff to `app`
});
```

### [.use](index.js#L203)

Define a plugin function to be called immediately upon init. Plugins are chainable and the only parameter exposed to the plugin is the application instance.

**Params**

* `fn` **{Function}**: plugin function to call
* `returns` **{Object}**: Returns the item instance for chaining.

**Events**

* `emits`: `use` with no arguments.

**Example**

```js
var app = new Base()
  .use(foo)
  .use(bar)
  .use(baz)
```

### [.define](index.js#L226)

Define a non-enumerable property on the instance. Dot-notation is **not supported** with `define`.

**Params**

* `key` **{String}**: The name of the property to define.
* `value` **{any}**
* `returns` **{Object}**: Returns the instance for chaining.

**Events**

* `emits`: `define` with `key` and `value` as arguments.

**Example**

```js
// arbitrary `render` function using lodash `template`
define('render', function(str, locals) {
  return _.template(str)(locals);
});
```

### [.mixin](index.js#L244)

Mix property `key` onto the Base prototype. If base-methods
is inherited using `Base.extend` this method will be overridden
by a new `mixin` method that will only add properties to the
prototype of the inheriting application.

**Params**

* `key` **{String}**
* `val` **{Object|Array}**
* `returns` **{Object}**: Returns the `base` instance for chaining.

### [Base.use](index.js#L267)

Static method for adding global plugin functions that will be added to an instance when created.

**Params**

* `fn` **{Function}**: Plugin function to use on each instance.
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
Base.use(function(app) {
  app.foo = 'bar';
});
var app = new Base();
console.log(app.foo);
//=> 'bar'
```

### [Base.extend](index.js#L293)

Static method for inheriting both prototype and static methods of the `Base` class. See [class-utils](https://github.com/jonschlinkert/class-utils) for more details.

**Params**

* `Ctor` **{Function}**: constructor to extend
* `methods` **{Object}**: Optional prototype properties to mix in.
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
var extend = cu.extend(Parent);
Parent.extend(Child);

// optional methods
Parent.extend(Child, {
  foo: function() {},
  bar: function() {}
});
```

### [Base.mixin](index.js#L333)

Static method for adding mixins to the prototype. When a function is returned from the mixin plugin, it will be added to an array so it can be used on inheriting classes via `Base.mixins(Child)`.

**Params**

* `fn` **{Function}**: Function to call
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
Base.mixin(function fn(proto) {
  proto.foo = function(msg) {
    return 'foo ' + msg;
  };
  return fn;
});
```

### [Base.mixins](index.js#L355)

Static method for running currently saved global mixin functions against a child constructor.

**Params**

* `Child` **{Function}**: Constructor function of a child class
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
Base.extend(Child);
Base.mixins(Child);
```

### [Base.inherit](index.js#L375)

Similar to `util.inherit`, but copies all static properties, prototype properties, and descriptors from `Provider` to `Receiver`. [class-utils](https://github.com/jonschlinkert/class-utils) for more details.

**Params**

* `Receiver` **{Function}**: Receiving (child) constructor
* `Provider` **{Function}**: Providing (parent) constructor
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
Base.inherit(Foo, Bar);
```

## In the wild

The following node.js applications were built with `Base`:

* [assemble](https://github.com/assemble/assemble)
* [verb](https://github.com/verbose/verb)
* [generate](https://github.com/generate/generate)
* [scaffold](https://github.com/jonschlinkert/scaffold)
* [boilerplate](http://boilerplates.io)

## Test coverage

```
Statements   : 98.95% ( 94/95 )
Branches     : 95.83% ( 23/24 )
Functions    : 100% ( 17/17 )
Lines        : 98.94% ( 93/94 )
```

## History

**v0.9.0 - major breaking changes!**

* `.is` no longer takes a function, a string must be passed
* all remaining `.debug` code has been removed
* `app._namespace` was removed (related to `debug`)
* `.plugin`, `.use`, and `.define` no longer emit events
* `.assertPlugin` was removed
* `.lazy` was removed

## Related projects

There are a number of different plugins available for extending base. Let us know if you create your own!

* [base-cwd](https://www.npmjs.com/package/base-cwd): Base plugin that adds a getter/setter for the current working directory. | [homepage](https://github.com/node-base/base-cwd "Base plugin that adds a getter/setter for the current working directory.")
* [base-data](https://www.npmjs.com/package/base-data): adds a `data` method to base-methods. | [homepage](https://github.com/node-base/base-data "adds a `data` method to base-methods.")
* [base-fs](https://www.npmjs.com/package/base-fs): base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file… [more](https://github.com/node-base/base-fs) | [homepage](https://github.com/node-base/base-fs "base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file system, like src, dest, copy and symlink.")
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/node-base/base-generators "Adds project-generator support to your `base` application.")
* [base-option](https://www.npmjs.com/package/base-option): Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme… [more](https://github.com/node-base/base-option) | [homepage](https://github.com/node-base/base-option "Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme for the full API.")
* [base-pipeline](https://www.npmjs.com/package/base-pipeline): base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines. | [homepage](https://github.com/node-base/base-pipeline "base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines.")
* [base-pkg](https://www.npmjs.com/package/base-pkg): Plugin for adding a `pkg` method that exposes pkg-store to your base application. | [homepage](https://github.com/node-base/base-pkg "Plugin for adding a `pkg` method that exposes pkg-store to your base application.")
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base applications to allow plugins to be called any time after… [more](https://github.com/node-base/base-plugins) | [homepage](https://github.com/node-base/base-plugins "Upgrade's plugin support in base applications to allow plugins to be called any time after init.")
* [base-questions](https://www.npmjs.com/package/base-questions): Plugin for base-methods that adds methods for prompting the user and storing the answers on… [more](https://github.com/node-base/base-questions) | [homepage](https://github.com/node-base/base-questions "Plugin for base-methods that adds methods for prompting the user and storing the answers on a project-by-project basis.")
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://github.com/node-base/base-store) | [homepage](https://github.com/node-base/base-store "Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object that exposes all of the methods from the data-store library. Also now supports sub-stores!")
* [base-task](https://www.npmjs.com/package/base-task): base plugin that provides a very thin wrapper around [https://github.com/doowb/composer](https://github.com/doowb/composer) for adding task methods to… [more](https://github.com/node-base/base-task) | [homepage](https://github.com/node-base/base-task "base plugin that provides a very thin wrapper around <https://github.com/doowb/composer> for adding task methods to your application.")

## Contributing

This document was generated by [verb](https://github.com/verbose/verb), please don't edit directly. Any changes to the readme must be made in [.verb.md](.verb.md). See [Building Docs](#building-docs).

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/node-base/base/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-readme-generator && verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/node-base/base/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on June 03, 2016._