'use strict';

require('mocha');
const assert = require('assert');
let Base = require('./');
let base;

describe('constructor', function() {
  it('should return an instance of Base', function() {
    base = new Base();
    assert(base instanceof Base);
  });

  it('should "visit" over an object to extend the instance', function() {
    base = new Base({ foo: 'bar' });
    assert.equal(base.cache.foo, 'bar');
    const app = new Base(null, { a: true, b: false });
    assert(app.options);
    assert.equal(app.options.a, true);
    assert.equal(app.options.b, false);
  });

  it('should map "visit" over an array to extend the instance', function() {
    base = new Base([{foo: 'bar'}, {baz: 'qux'}]);
    assert.equal(base.cache.foo, 'bar');
    assert.equal(base.cache.baz, 'qux');
  });

  it('should set options passed as the second argument', function() {
    base = new Base(null, {abc: 'xyz'});
    assert.equal(base.options.abc, 'xyz');
  });

  it('should merge options throughout the inheritance chain', function() {
    class Foo extends Base {
      constructor(options) {
        super(null, options);
        this.options.x = 'y';
      }
    }

    class Bar extends Foo {}
    const bar = new Bar({a: 'b'});

    assert.equal(bar.options.a, 'b');
    assert.equal(bar.options.x, 'y');
  });

  it('should set isApp on the instance', function() {
    base = new Base();
    assert.equal(base.isApp, true);
  });
});

describe('static properties', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should expose `.use` method', function() {
    assert.equal(typeof Base.use, 'function');
  });

  it('should extend static properties', function() {
    class Ctor extends Base {}
    assert.equal(typeof Ctor.use, 'function');
  });

  describe('.use', function() {
    it('should use a globally loaded plugin through the static use method', function() {
      class Ctor extends Base {}
      Ctor.use(function(app) {
        app.foo = 'bar';
      });
      const inst = new Ctor();
      assert.equal(inst.foo, 'bar');
    });

    it('should use a globally loaded plugin through the static use method with namespace', function() {
      const Foo = Base.namespace('foo');
      Foo.use(function(app) {
        app.set('bar', 'baz');
      });
      const inst = new Foo();
      assert.equal(inst.get('bar'), 'baz');
      assert.equal(inst.foo.bar, 'baz');
    });

    it('should use different globally installed plugins when using different namespaces', function() {
      const Foo = Base.namespace('foo');
      const Bar = Base.namespace('bar');

      Foo.use(function(app) {
        app.set('bar', 'baz');
      });
      Bar.use(function(app) {
        app.set('beep', 'boop');
      });

      const foo = new Foo();
      const bar = new Bar();

      assert.equal(foo.get('bar'), 'baz');
      assert.equal(foo.foo.bar, 'baz');
      assert.equal(typeof foo.get('beep'), 'undefined');
      assert.equal(typeof foo.foo.beep, 'undefined');

      assert.equal(bar.get('beep'), 'boop');
      assert.equal(bar.bar.beep, 'boop');
      assert.equal(typeof bar.get('bar'), 'undefined');
      assert.equal(typeof bar.bar.bar, 'undefined');
    });
  });
});

describe('extend prototype methods', function() {
  beforeEach(function() {
    const Ctor = require('./');
    Base = Ctor.namespace();
  });

  it('should extend the prototype of the given Ctor', function() {
    class Ctor extends Base {}
    assert.equal(typeof Ctor.use, 'function');

    const ctor = new Ctor();
    assert.equal(typeof ctor.set, 'function');
    assert.equal(typeof ctor.get, 'function');
  });

  it('should expose `prototype.set` method', function() {
    assert.equal(typeof Base.prototype.set, 'function');
  });

  it('should expose `prototype.get` method', function() {
    assert.equal(typeof Base.prototype.get, 'function');
  });

  it('should expose `prototype.del` method', function() {
    assert.equal(typeof Base.prototype.del, 'function');
  });

  it('should expose `prototype.visit` method', function() {
    assert.equal(typeof Base.prototype.visit, 'function');
  });

  it('should expose `prototype.define` method', function() {
    assert.equal(typeof Base.prototype.define, 'function');
  });

  it('should add prototype methods to the given Ctor', function() {
    class Ctor extends Base {}
    assert.equal(typeof Ctor.prototype.set, 'function');
    assert.equal(typeof Ctor.prototype.get, 'function');
    assert.equal(typeof Ctor.prototype.del, 'function');
    assert.equal(typeof Ctor.prototype.visit, 'function');
    assert.equal(typeof Ctor.prototype.define, 'function');
  });
});

describe('instance properties', function() {
  beforeEach(function() {
    const Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should expose the options property', function() {
    assert(base.options);
    assert.equal(typeof base.options, 'object');
  });

  it('should expose the cache property', function() {
    assert(base.cache);
    assert.equal(typeof base.cache, 'object');
  });
});

describe('prototype methods', function() {
  beforeEach(function() {
    const Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  describe('.use', function() {
    beforeEach(function() {
      base = new Base();
    });

    it('should expose a .use method', function() {
      assert(base.use);
      assert.equal(typeof base.use, 'function');
    });

    it('should call the function passed to `use`', function(cb) {
      base.use(function(app) {
        assert(app);
        cb();
      });
    });

    it('should expose the app instance', function(cb) {
      base.foo = 'bar';
      base.use(function(app) {
        assert.equal(app.foo, 'bar');
        cb();
      });
    });

    it('should expose the app instance as "this"', function(cb) {
      base.foo = 'bar';
      base.use(function(app) {
        assert.equal(this.foo, 'bar');
        cb();
      });
    });

    it('should run a plugin multiple times', function() {
      base.count = 0;
      function plugin() {
        delete this.registered.plugin;
        this.count++;
      }
      base.use(plugin);
      base.use(plugin);
      base.use(plugin);
      assert.equal(base.count, 3);
    });

    it('should not run a plugin more than once when a plugin name is given', function() {
      base.count = 0;
      function plugin() {
        this.count++;
      }
      base.use('foo', plugin);
      base.use('foo', plugin);
      base.use('foo', plugin);
      assert.equal(base.count, 1);
    });
  });

  describe('when `isRegistered` is used', function() {
    it('should not call a plugin more than once on the same instance', function() {
      base.i = 0;
      function plugin(app) {
        if (app.isRegistered('foo')) return;
        base.i++;
      }

      base.use(plugin);
      base.use(plugin);
      base.use(plugin);
      base.use(plugin);

      assert.equal(base.i, 1);
    });

    it('should not register a plugin when `false` is passed as the 2nd arg', function() {
      function plugin(app) {
        if (app.isRegistered('foo', false)) return;
        this.foo = 'bar';
      }

      base.use(plugin);
      assert(!base.registered.hasOwnProperty('foo'));
      assert.equal(base.foo, 'bar');
    });

    it('should not call a plugin more than once on the same instance', function() {
      base.i = 0;
      function plugin(app) {
        if (app.isRegistered('foo')) return;
        base.i++;
      }

      base.use(plugin);
      base.use(plugin);
      base.use(plugin);
      base.use(plugin);

      assert.equal(base.i, 1);
    });
  });

  describe('.define', function() {
    it('should define a key-value pair on the instance', function() {
      base.define('foo', 'bar');
      assert.equal(base.foo, 'bar');
    });

    it('should define an own property', function() {
      base.define('foo', 'bar');
      assert(base.hasOwnProperty('foo'));
    });

    it('should define a non-emumerable property', function() {
      base.define('foo', 'bar');
      assert(Object.keys(base).indexOf('foo') === -1);
    });

    it('should multiple properties', function() {
      base.define({
        foo: 'bar',
        baz: 'qux'
      });

      assert(base.hasOwnProperty('foo'));
      assert(base.hasOwnProperty('baz'));
    });
  });

  describe('.set', function() {
    it('should set a key-value pair on the instance', function() {
      base.set('foo', 'bar');
      assert.equal(base.cache.foo, 'bar');
    });

    it('should set nested property', function() {
      base.set('a.b.c', 'd');
      assert.equal(base.cache.a.b.c, 'd');
    });

    it('should set a nested property with the key as an array', function() {
      base.set(['a', 'b', 'c'], 'd');
      assert.equal(base.cache.a.b.c, 'd');
    });

    it('should set an object on the instance', function() {
      base.set({a: 'b'});
      assert.equal(base.cache.a, 'b');
    });
  });

  describe('.get', function() {
    it('should get a property from the instance', function() {
      base.set({a: 'b'});
      assert.equal(base.get('a'), 'b');
    });

    it('should get a nested property from the instance', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get('a.b.c'), 'd');
    });

    it('should get a property using an array', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get(['a', 'b', 'c']), 'd');
    });

    it('should get a property using an array of path segments', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get(['a', 'b', 'c']), 'd');
      assert.equal(base.get(['a.b', 'c']), 'd');
    });
  });

  describe('.has', function() {
    it('should work with namespaces', function() {
      const Ctor = require('./');
      Base = Ctor.namespace('cache');
      const foo = new Base();

      foo.set({a: 'b'});
      assert.equal(foo.has('a'), true);
    });

    it('should check for a property from the instance', function() {
      base.set({a: 'b'});
      assert.equal(base.has('a'), true);
    });

    it('should check for a nested property from the instance', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.has('a.b.c'), true);
    });

    it('should check for a property using an array', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.has(['a', 'b', 'c']), true);
    });

    it('should check for a property using a list of arguments', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.has('a', 'b', 'c'), true);
      assert.equal(base.has(['a', 'b'], 'c'), true);
      assert.equal(base.has('a', ['b', 'c']), true);
      assert.equal(base.has('a', 'b.c'), true);
    });
  });

  describe('.visit', function() {
    it('should visit an object with the given method', function() {
      base.visit('set', {a: 'b', c: 'd'});
      assert.equal(base.get('a'), 'b');
      assert.equal(base.get('c'), 'd');
    });
    it('should visit an array with the given method', function() {
      base.visit('set', [{a: 'b', c: 'd'}]);
      assert.equal(base.get('a'), 'b');
      assert.equal(base.get('c'), 'd');
    });
  });

  describe('.del', function() {
    it('should remove a property', function() {
      base.set({a: 'b'});
      assert.equal(base.cache.a, 'b');
      base.del('a');
      assert.equal(typeof base.cache.a, 'undefined');
    });

    it('should remove an array of properties', function() {
      base.set({
        a: 'a'
      });
      base.set({
        b: 'b'
      });
      assert.equal(base.cache.a, 'a');
      assert.equal(base.cache.b, 'b');
      base.del('a');
      base.del('b');
      assert.equal(typeof base.cache.a, 'undefined');
      assert.equal(typeof base.cache.b, 'undefined');
    });
  });
});

describe('namespaces', function() {
  beforeEach(function() {
    Base = require('./');
  });

  describe('constructor', function() {
    it('should expose `namespace`', function() {
      assert.equal(typeof Base.namespace, 'function');
    });

    it('should extend the given Ctor with static methods', function() {
      const Foo = Base.namespace('cache');
      class Ctor extends Foo {}
      assert.equal(typeof Ctor.use, 'function');
    });
  });

  describe('prototype methods', function() {
    beforeEach(function() {
      const Custom = Base.namespace('cache');
      base = new Custom();
    });

    describe('set', function() {
      it('should set a key-value pair on the instance', function() {
        base.set('foo', 'bar');
        assert.equal(base.cache.foo, 'bar');
      });

      it('should set an object on the instance', function() {
        base.set({
          a: 'b'
        });
        assert.equal(base.cache.a, 'b');
      });
    });

    describe('get', function() {
      it('should get a property from the instance', function() {
        base.set({
          a: 'b'
        });
        assert.equal(base.get('a'), 'b');
      });

      it('should visit an object with the given method', function() {
        base.visit('set', {
          a: 'b',
          c: 'd'
        });
        assert.equal(base.get('a'), 'b');
        assert.equal(base.get('c'), 'd');
      });
      it('should visit an array with the given method', function() {
        base.visit('set', [{
          a: 'b',
          c: 'd'
        }]);
        assert.equal(base.get('a'), 'b');
        assert.equal(base.get('c'), 'd');
      });
    });

    describe('del', function() {
      it('should remove a property', function() {
        base.set({a: 'b'});
        assert.equal(base.cache.a, 'b');
        base.del('a');
        assert.equal(typeof base.cache.a, 'undefined');
      });
    });
  });
});

describe('.base', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should set a `base` property on the instance', function() {
    assert(base.base);
    assert.equal(typeof base.base, 'object');
  });

  it('should use `parent` to set app.base', function() {
    const foo = new Base();
    foo.abc = 'xyz';

    const bar = new Base();
    bar.parent = foo;

    const baz = new Base();
    baz.parent = bar;

    assert(baz.base);
    assert.equal(baz.base.abc, 'xyz');
  });
});

describe('.is', function() {
  beforeEach(function() {
    const Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should set a name prefixed with `is` on the instance', function() {
    base.is('Foo');
    assert(base.isFoo);
    assert.equal(base.type, 'foo');
    assert.equal(base.isFoo, true);
  });

  it('should remove isApp when another type is set', function() {
    base.is('Foo');
    assert(base.isFoo);
    assert.equal(base.isApp, undefined);
  });
});

describe('events', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should emit and listen for events', function(cb) {
    base.on('foo', function(val) {
      assert.equal(val, 'bar');
      cb();
    });
    base.emit('foo', 'bar');
  });

  it('should emit set', function(cb) {
    base.on('set', function(key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
      cb();
    });
    base.set('foo', 'bar');
  });

  it('should emit get', function(cb) {
    base.on('get', function(key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
      cb();
    });
    base.set('foo', 'bar');
    base.get('foo');
  });

  it('should emit del', function(cb) {
    base.on('del', function(key, val) {
      assert.equal(key, 'foo');
      cb();
    });
    base.set('foo', 'bar');
    base.del('foo');
  });

  it('should emit when a named plugin is registered the first time', function() {
    const foo = () => () => {};
    let count = 0;
    base = new Base();
    base.on('plugin', () => (count++));
    base.use('foo', foo());
    base.use('foo', foo());
    base.use('foo', foo());
    base.use('foo', foo());
    assert.equal(count, 1);
  });
});
