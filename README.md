<p align="center">

<a href="https://github.com/node-base/base">
<img height="250" width="250" src="https://raw.githubusercontent.com/node-base/base/master/docs/logo.png">
</a>
</p>

# base

[![NPM version](https://img.shields.io/npm/v/base.svg?style=flat)](https://www.npmjs.com/package/base) [![NPM monthly downloads](https://img.shields.io/npm/dm/base.svg?style=flat)](https://npmjs.org/package/base) [![Build Status](https://img.shields.io/travis/node-base/base.svg?style=flat)](https://travis-ci.org/node-base/base) [![Gitter](https://badges.gitter.im/join_chat.svg)](https://gitter.im/node-base/base)

<details>
<summary><strong>Table of contents</strong></summary>

- [Why use Base?](#why-use-base)
  * [Guiding principles](#guiding-principles)
  * [Minimal API surface](#minimal-api-surface)
  * [Composability](#composability)
- [Install](#install)
- [Install](#install-1)
- [Usage](#usage)
- [API](#api)
- [cache object](#cache-object)
- [Toolkit suite](#toolkit-suite)
  * [What is Toolkit?](#what-is-toolkit)
- [About](#about)
  * [Related projects](#related-projects)
  * [Tests](#tests)
  * [Contributing](#contributing)
  * [Release History](#release-history)
  * [Authors](#authors)
  * [License](#license)

</details>

<details>
<summary><strong>About</strong></summary>

## Why use Base?

Base is a foundation for creating modular, unit testable and highly pluggable server-side node.js APIs.

* Go from zero to working application within minutes
* Use [community plugins](https://www.npmjs.com/browse/keyword/baseplugin) to add feature-functionality to your application
* Create your own custom plugins to add features
* Like building blocks, plugins are stackable. Allowing you to build [sophisticated applications](#toolkit-suite) from simple plugins. Moreover, those applications can also be used as plugins themselves.

Most importantly, once you learn Base, you will be familiar with the core API of all applications built on Base. This means you will not only benefit as a developer, but as a user as well.

### Guiding principles

The core team follows these principles to help guide API decisions:

* **Compact API surface**: The smaller the API surface, the easier the library will be to learn and use.
* **Easy to extend**: Implementors can use any npm package, and write plugins in pure JavaScript. If you're building complex apps, Base dramatically simplifies inheritance.
* **Easy to test**: No special setup should be required to unit test `Base` or base plugins
* **100% Node.js core style**

  - No API sugar (left for higher level projects)
  - Written in readable vanilla JavaScript

### Minimal API surface

[The API](#api) was designed to provide only the minimum necessary functionality for creating a useful application, with or without [plugins](#plugins).

**Base core**

Base itself ships with only a handful of [useful methods](#api), such as:

* `.set`: for setting values on the instance
* `.get`: for getting values from the instance
* `.has`: to check if a property exists on the instance
* `.define`: for setting non-enumerable values on the instance
* `.use`: for adding plugins

**Be generic**

When deciding on method to add or remove, we try to answer these questions:

1. Will all or most Base applications need this method?
2. Will this method encourage practices or enforce conventions that are beneficial to implementors?
3. Can or should this be done in a plugin instead?

### Composability

**Plugin system**

It couldn't be easier to extend Base with any features or custom functionality you can think of.

Base plugins are just functions that take an instance of `Base`:

```js
var base = new Base();

function plugin(base) {
  // do plugin stuff, in pure JavaScript
}
// use the plugin
base.use(plugin);
```

Add "smart plugin" functionality with the [base-plugins](https://github.com/node-base/base-plugins) plugin.

**Inheritance**

Easily inherit Base using `.extend`:

```js
var Base = require('base');

function MyApp() {
  Base.call(this);
}
Base.extend(MyApp);

var app = new MyApp();
app.set('a', 'b');
app.get('a');
//=> 'b';
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
</details>

## Install

**NPM**

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save base
```

**yarn**

Install with [yarn](yarnpkg.com):

```sh
$ yarn add base && yarn upgrade
```

## Usage

```js
var Base = require('base');
var app = new Base();

// set a value
app.set('foo', 'bar');
console.log(app.foo);
//=> 'bar'

// register a plugin
app.use(function() {
  // do stuff (see API docs for ".use")
});
```

## API

### [Base](index.js#L43)

Create an instance of `Base` with the given `cache` and `options`. Learn about the [cache object](#cache-object).

**Params**

* `cache` **{Object}**: If supplied, this object is passed to [cache-base](https://github.com/jonschlinkert/cache-base) to merge onto the the instance.
* `options` **{Object}**: If supplied, this object is used to initialize the `base.options` object.

**Example**

```js
// initialize with `cache` and `options`
const app = new Base({isApp: true}, {abc: true});
app.set('foo', 'bar');

// values defined with the given `cache` object will be on the root of the instance
console.log(app.baz); //=> undefined
console.log(app.foo); //=> 'bar'
// or use `.get`
console.log(app.get('isApp')); //=> true
console.log(app.get('foo')); //=> 'bar'

// values defined with the given `options` object will be on `app.options
console.log(app.options.abc); //=> true
```

### [.is](index.js#L74)

Set the given `name` on `app._name` and `app.is*` properties. Used for doing lookups in plugins.

**Params**

* `name` **{String}**
* `returns` **{Boolean}**

**Example**

```js
app.is('collection');
console.log(app.type);
//=> 'collection'
console.log(app.isCollection);
//=> true
```

### [.isRegistered](index.js#L110)

Returns true if a plugin has already been registered on an instance.

Plugin implementors are encouraged to use this first thing in a plugin
to prevent the plugin from being called more than once on the same
instance.

**Params**

* `name` **{String}**: The plugin name.
* `register` **{Boolean}**: If the plugin if not already registered, to record it as being registered pass `true` as the second argument.
* `returns` **{Boolean}**: Returns true if a plugin is already registered.

**Events**

* `emits`: `plugin` Emits the name of the plugin being registered. Useful for unit tests, to ensure plugins are only registered once.

**Example**

```js
const base = new Base();
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

### [.use](index.js#L139)

Call a plugin function or array of plugin functions on the instance. Plugins are called with an instance of base, and options (if defined).

**Params**

* `name` **{String|Function|Array}**: (optional) plugin name
* `plugin` **{Function|Array}**: plugin function, or array of functions, to call.
* **{...rest}**: Any additional arguments to pass to plugins(s).
* `returns` **{Object}**: Returns the item instance for chaining.

**Example**

```js
const app = new Base()
  .use([foo, bar])
  .use(baz)
```

### [.define](index.js#L178)

The `.define` method is used for adding non-enumerable property on the instance. Dot-notation is **not supported** with `define`.

**Params**

* `key` **{String}**: The name of the property to define.
* `value` **{any}**
* `returns` **{Object}**: Returns the instance for chaining.

**Example**

```js
// example of a custom arbitrary `render` function created with lodash's `template` method
app.define('render', (str, locals) => _.template(str)(locals));
```

### [.base](index.js#L220)

Getter/setter used when creating nested instances of `Base`, for storing a reference to the first ancestor instance. This works by setting an instance of `Base` on the `parent` property of a "child" instance. The `base` property defaults to the current instance if no `parent` property is defined.

**Example**

```js
// create an instance of `Base`, this is our first ("base") instance
const first = new Base();
first.foo = 'bar'; // arbitrary property, to make it easier to see what's happening later

// create another instance
const second = new Base();
// create a reference to the first instance (`first`)
second.parent = first;

// create another instance
const third = new Base();
// create a reference to the previous instance (`second`)
// repeat this pattern every time a "child" instance is created
third.parent = second;

// we can always access the first instance using the `base` property
console.log(first.base.foo);
//=> 'bar'
console.log(second.base.foo);
//=> 'bar'
console.log(third.base.foo);
//=> 'bar'
```

### [Base.use](index.js#L242)

Static method for adding global plugin functions that will be added to an instance when created.

**Params**

* `fn` **{Function}**: Plugin function to use on each instance.
* `returns` **{Object}**: Returns the `Base` constructor for chaining

**Example**

```js
Base.use(function(app) {
  app.foo = 'bar';
});
const app = new Base();
console.log(app.foo);
//=> 'bar'
```

## cache object

**Cache**

User-defined properties go on the `cache` object. This keeps the root of the instance clean, so that only reserved methods and properties on the root.

```js
Base { cache: {} }
```

You can pass a custom object to use as the `cache` as the first argument to the `Base` class when instantiating.

```js
const myObject = {};
const Base = require('base');
const base = new Base(myObject);
```

## Toolkit suite

Base is part of the [Toolkit suite](https://github.com/node-toolkit/getting-started) of applications.

### What is Toolkit?

Toolkit is a collection of node.js libraries, applications and frameworks for helping developers quickly create high quality node.js applications, web projects, and command-line experiences. There are many other libraries on NPM for handling specific tasks, Toolkit provides the _systems_ and _building blocks_ for creating higher level workflows and processes around those libraries.

Toolkit can be used to create a static site generator, blog framework, documentaton system, command line, task or plugin runner, and more!

**Building Blocks**

The following libraries can be used as "building blocks" for creating modular applications.

* [base](https://github.com/node-base/base): (you are here!) framework for rapidly creating high quality node.js applications, using plugins like building blocks. Base serves as the foundation for several other applications in the [Toolkit suite](https://github.com/node-toolkit/getting-started).
* [templates](https://github.com/jonschlinkert/templates): Render templates with any node.js template engine, create and manage template collections. Use helpers, layouts, partials, includes...
* [enquirer](http://enquirer.io): Plugin-based prompt system for creating highly customizable command line experiences.
* [composer](https://github.com/doowb/composer): Plugin-based, async task runner.

**Lifecycle Applications**

The following applications provide workflows and automation for common phases of the software development lifecycle. Each of these tools can be used entirely standalone or bundled together.

* [generate](https://github.com/generate/generate): create projects
* [assemble](https://github.com/assemble/assemble): build projects
* [verb](https://github.com/verbose/verb): document projects
* [update](https://github.com/update/update): maintain projects

## About

### Related projects

* [base-cwd](https://www.npmjs.com/package/base-cwd): Base plugin that adds a getter/setter for the current working directory. | [homepage](https://github.com/node-base/base-cwd "Base plugin that adds a getter/setter for the current working directory.")
* [base-data](https://www.npmjs.com/package/base-data): adds a `data` method to base-methods. | [homepage](https://github.com/node-base/base-data "adds a `data` method to base-methods.")
* [base-fs](https://www.npmjs.com/package/base-fs): base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file… [more](https://github.com/node-base/base-fs) | [homepage](https://github.com/node-base/base-fs "base-methods plugin that adds vinyl-fs methods to your 'base' application for working with the file system, like src, dest, copy and symlink.")
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/node-base/base-generators "Adds project-generator support to your `base` application.")
* [base-option](https://www.npmjs.com/package/base-option): Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme… [more](https://github.com/node-base/base-option) | [homepage](https://github.com/node-base/base-option "Adds a few options methods to base, like `option`, `enable` and `disable`. See the readme for the full API.")
* [base-pipeline](https://www.npmjs.com/package/base-pipeline): base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines. | [homepage](https://github.com/node-base/base-pipeline "base-methods plugin that adds pipeline and plugin methods for dynamically composing streaming plugin pipelines.")
* [base-pkg](https://www.npmjs.com/package/base-pkg): Plugin for adding a `pkg` method that exposes pkg-store to your base application. | [homepage](https://github.com/node-base/base-pkg "Plugin for adding a `pkg` method that exposes pkg-store to your base application.")
* [base-plugins](https://www.npmjs.com/package/base-plugins): Adds 'smart plugin' support to your base application. | [homepage](https://github.com/node-base/base-plugins "Adds 'smart plugin' support to your base application.")
* [base-questions](https://www.npmjs.com/package/base-questions): Plugin for base-methods that adds methods for prompting the user and storing the answers on… [more](https://github.com/node-base/base-questions) | [homepage](https://github.com/node-base/base-questions "Plugin for base-methods that adds methods for prompting the user and storing the answers on a project-by-project basis.")
* [base-store](https://www.npmjs.com/package/base-store): Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object… [more](https://github.com/node-base/base-store) | [homepage](https://github.com/node-base/base-store "Plugin for getting and persisting config values with your base-methods application. Adds a 'store' object that exposes all of the methods from the data-store library. Also now supports sub-stores!")
* [base-task](https://www.npmjs.com/package/base-task): Base plugin that provides a very thin wrapper around [https://github.com/doowb/composer](https://github.com/doowb/composer) for adding task methods to… [more](https://github.com/base/base-task) | [homepage](https://github.com/base/base-task "Base plugin that provides a very thin wrapper around <https://github.com/doowb/composer> for adding task methods to your Base application.")

### Tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

If Base doesn't do what you need, [please let us know](../../issues).

### Release History

See the [changelog](CHANGELOG.md);

### Authors

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](http://twitter.com/doowb)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
MIT

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on March 29, 2018._