# Release History

## key

Changelog entries are classified using the following labels from [keep-a-changelog][]:

* `added`: for new features
* `changed`: for changes in existing functionality
* `deprecated`: for once-stable features removed in upcoming releases
* `removed`: for deprecated features removed in this release
* `fixed`: for any bug fixes

Custom labels used in this changelog:

* `dependencies`: bumps dependencies
* `housekeeping`: code re-organization, minor edits, or other changes that don't fit in one of the other categories.

**Heads up!**

Please [let us know](../../issues) if any of the following heading links are broken. Thanks!

## [3.0.0]

**Breaking changes**

- Methods no longer set values on the root of the instance. By default, `.get`, `.get`, `.has`, `.del` and other method use the `base.cache` object. This can be customized by doing `new Base.create('foo')` where `foo` is the property name to use for the cache. 

## [2.0.2]

**Fixed**

- Removed a check for function name in the `.use` method. This could cause plugins to not get registered.

## [2.0.0]

**Changed**

- Removed _static_ `.run` method since it's unnecessary (i.e. if you have the instance, you can just use `.use`)
- adds support for passing arrays of functions to `.use` method

## [1.0.0]

First major release! 

**Changed**

- Refactored to use ES class 

## [0.12.0]

**Fixed**

- ensure `__callbacks` and `super_` are non-enumberable

**Added**

- Now sets `app.type` when `app.is('foo')` is called. This allows Base instances to be used more like AST nodes, which is especially helpful with [smart plugins](https://github.com/node-base/base-plugins)

## [0.11.0]

**Changed**

- Static `.use` and `.run` methods are now non-enumerable

## [0.9.0](https://github.com/node-base/base/compare/0.8.0...0.9.0)

**Changed**

- `.is` no longer takes a function, a string must be passed 
- all remaining `.debug` code has been removed
- `app._namespace` was removed (related to `debug`)
- `.plugin`, `.use`, and `.define` no longer emit events
- `.assertPlugin` was removed
- `.lazy` was removed


[2.0.2]: https://github.com/node-base/base/compare/1.0.0...2.0.2
[2.0.0]: https://github.com/node-base/base/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/node-base/base/compare/0.13.2...1.0.0
[0.12.0]: https://github.com/node-base/base/compare/0.11.1...0.12.0
[0.11.0]: https://github.com/node-base/base/compare/0.10.0...0.11.0
[0.9.0]: https://github.com/node-base/base/compare/0.8.1...0.9.0

[Unreleased]: https://github.com/node-base/base/compare/0.1.1...HEAD
[keep-a-changelog]: https://github.com/olivierlacan/keep-a-changelog

