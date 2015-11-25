# base-methods [![NPM version](https://badge.fury.io/js/base-methods.svg)](http://badge.fury.io/js/base-methods)

> Starter for creating a node.js application with a handful of common methods, like `set`, `get`, and `del`.

Great way to start building a highly modular, unit testable and [pluggable](#plugins) node.js application!

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i base-methods --save
```

## Usage

```js
var base = require('base-methods');
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

A `.namespace()` method is exposed on the exported function to allow you to create a custom namespace for setting/getting on the instance.

```js
var Base = require('base-methods')
var base = Base.namespace('cache');

var app = base();
app.set('foo', 'bar');
console.log(app.cache.foo);
//=> 'bar'
```

## API

### [Base](index.js#L29)

Create an instance of `Base` with `options`.

**Params**

* `options` **{Object}**

**Example**

```js
var app = new Base();
app.set('foo', 'bar');
console.log(app.get('foo'));
//=> 'bar'
```

### [.use](index.js#L76)

Define a plugin function to be called immediately upon init. Plugins are chainable and the only parameter exposed to the plugin is the application instance.

**Params**

* `fn` **{Function}**: plugin function to call
* `returns` **{Object}**: Returns the item instance for chaining.

**Example**

```js
var app = new Base()
  .use(foo)
  .use(bar)
  .use(baz)
```

### [.set](index.js#L107)

Assign `value` to `key`. Also emits `set` with the key and value.

**Params**

* `key` **{String}**
* `value` **{any}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
app.on('set', function(key, val) {
  // do something when `set` is emitted
});

app.set(key, value);

// also takes an object or array
app.set({name: 'Halle'});
app.set([{foo: 'bar'}, {baz: 'quux'}]);
console.log(app);
//=> {name: 'Halle', foo: 'bar', baz: 'quux'}
```

### [.get](index.js#L139)

Return the stored value of `key`. Dot notation may be used to get [nested property values][get-value].

**Params**

* `key` **{any}**
* `returns` **{any}**

**Example**

```js
app.set('a.b.c', 'd');
app.get('a.b');
//=> {c: 'd'}

app.get(['a', 'b']);
//=> {c: 'd'}
```

### [.has](index.js#L165)

Return true if app has a stored value for `key`, false only if `typeof` value is `undefined`.

**Params**

* `key` **{any}**
* `returns` **{any}**

**Example**

```js
app.set('foo', 'bar');
app.has('foo');
//=> true
```

### [.del](index.js#L193)

Delete `key` from the instance. Also emits `del` with the key of the deleted item.

**Params**

* `key` **{String}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
app.del(); // delete all
// or
app.del('foo');
// or
app.del(['foo', 'bar']);
```

### [.define](index.js#L219)

Define a non-enumerable property on the instance.

**Params**

* `key` **{String}**
* `value` **{any}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
// arbitrary `render` function using lodash `template`
define('render', function(str, locals) {
  return _.template(str)(locals);
});
```

### [.visit](index.js#L235)

Visit `method` over the items in the given object, or map
visit over the objects in an array.

**Params**

* `method` **{String}**
* `val` **{Object|Array}**
* `returns` **{Object}**: Returns the instance for chaining.

### [.mixin](index.js#L253)

Mix property `key` onto the Base prototype. If base-methods
is inherited using `Base.extend` this method will be overridden
by a new `mixin` method that will only add properties to the
prototype of the inheriting application.

**Params**

* `key` **{String}**
* `val` **{Object|Array}**
* `returns` **{Object}**: Returns the instance for chaining.

### [.use](index.js#L276)

Static method for adding global plugin functions that will be added to an instance when created.

**Params**

* `fn` **{Function}**: Plugin function to use on each instance.

**Example**

```js
Base.use(function(app) {
  app.foo = 'bar';
});
var app = new Base();
console.log(app.foo);
//=> 'bar'
```

### [.extend](index.js#L288)

Static method for inheriting both the prototype and
static methods of the `Base` class. See [class-utils][]
for more details.

### [.inherit](index.js#L298)

Similar to `util.inherit`, but copies all static properties,
prototype properties, and descriptors from `Provider` to `Receiver`.
[class-utils][] for more details.

## Plugins

There are a number of different plugins available for extending base-methods. Let us know if you create your own!

* [base-cli](https://www.npmjs.com/package/base-cli): Plugin for base-methods that maps built-in methods to CLI args (also supports methods from a… [more](https://www.npmjs.com/package/base-cli) | [homepage](https://github.com/jonschlinkert/base-cli)
* [base-config](https://www.npmjs.com/package/base-config): base-methods plugin that adds a `config` method for mapping declarative configuration values to other 'base'… [more](https://www.npmjs.com/package/base-config) | [homepage](https://github.com/jonschlinkert/base-config)
* [base-data](https://www.npmjs.com/package/base-data): adds a `data` method to base-methods. | [homepage](https://github.com/jonschlinkert/base-data)
* [base-fs](https://www.npmjs.com/package/base-fs): base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file… [more](https://www.npmjs.com/package/base-fs) | [homepage](https://github.com/jonschlinkert/base-fs)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-pipeline](https://www.npmjs.com/package/base-pipeline): base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines. | [homepage](https://github.com/jonschlinkert/base-pipeline)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://www.npmjs.com/package/base-store) | [homepage](https://github.com/jonschlinkert/base-store)

## Tests

### Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

### Coverage

```sh
Statements : 100% (15/15)
Branches   : 100% (2/2)
Functions  : 100% (2/2)
Lines      : 100% (15/15)
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-methods/issues/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 17, 2015._

[class-utils]: https://github.com/jonschlinkert/class-utils
[collection-visit]: https://github.com/jonschlinkert/collection-visit
[component-emitter]: https://github.com/component/emitter
[define-property]: https://github.com/jonschlinkert/define-property
[get-value]: https://github.com/jonschlinkert/get-value
[lazy-cache]: https://github.com/jonschlinkert/lazy-cache
[set-value]: https://github.com/jonschlinkert/set-value
[to-object-path]: https://github.com/jonschlinkert/to-object-path
[unset-value]: https://github.com/jonschlinkert/unset-value