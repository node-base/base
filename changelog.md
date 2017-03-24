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

## [0.12.0]

**Fixed**

- ensure `__callbacks` and `super_` are non-enumberable

**Added**

- Now sets `app.type` when `app.is('foo')` is called. This allows Base instances to be used more like AST nodes, which is especially helpful with [smart plugins](https://github.com/node-base/base-plugins)

## [0.11.0]

**Major breaking changes!**

- Static `.use` and `.run` methods are now non-enumerable

## [0.9.0](https://github.com/node-base/base/compare/0.8.0...0.9.0)

**Major breaking changes!**

- `.is` no longer takes a function, a string must be passed 
- all remaining `.debug` code has been removed
- `app._namespace` was removed (related to `debug`)
- `.plugin`, `.use`, and `.define` no longer emit events
- `.assertPlugin` was removed
- `.lazy` was removed


[keep-a-changelog]: https://github.com/olivierlacan/keep-a-changelog
