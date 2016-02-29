'use strict';

var assert = require('assert');
var Base = require('./index');
var base;

describe('constructor', function() {
  it('should return an instance of Base:', function() {
    base = new Base();
    assert(base instanceof Base);
  });

  it('should return an instance of Base without new:', function() {
    base = Base();
    assert(base instanceof Base);
  });

  it('should "visit" over an object to extend the instance', function() {
    base = new Base({foo: 'bar'});
    assert.equal(base.foo, 'bar');
    var app = new Base({options: {a: true, b: false}});
    assert(app.options);
    assert.equal(app.options.a, true);
    assert.equal(app.options.b, false);
  });

  it('should map "visit" over an array to extend the instance', function() {
    base = new Base([{foo: 'bar'}, {baz: 'qux'}]);
    assert.equal(base.foo, 'bar');
    assert.equal(base.baz, 'qux');
  });

  it('should set options passed as the second argument', function() {
    base = new Base(null, {abc: 'xyz'});
    assert.equal(base.options.abc, 'xyz');
  });

  it('should merge options throughout the inheritance chain', function() {
    function Foo(options) {
      Base.call(this, null, options);
      this.options.x = 'y';
    }
    Base.extend(Foo);

    function Bar(options) {
      Foo.call(this, options);
    }
    Foo.extend(Bar);

    var bar = new Bar({a: 'b'});

    assert.equal(bar.options.a, 'b');
    assert.equal(bar.options.x, 'y');
  });

  it('should add foo', function() {
    base = new Base({
      foo: 'bar'
    });
    assert.equal(base.foo, 'bar');
  });

  it('should set isBase on the instance', function() {
    base = new Base();
    assert.equal(base.isBase, true);
  });
});

describe('static properties', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should expose `.use` method', function() {
    assert.equal(typeof Base.use, 'function');
  });

  it('should expose `.extend` method', function() {
    assert.equal(typeof Base.extend, 'function');
  });

  it('should extend the given Ctor with static methods:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert.equal(typeof Ctor.extend, 'function');

    function foo() {}
    Ctor.extend(foo);
    assert.equal(typeof foo.extend, 'function');
  });

  describe('extend', function() {
    it('should set the extend method on the given object:', function() {
      function Ctor() {}
      Base.extend(Ctor);
      assert.equal(typeof Ctor.extend, 'function');
    });
  });

  describe('use', function() {
    it('should set the use method on the given object:', function() {
      function Ctor() {}
      Base.extend(Ctor);
      assert.equal(typeof Ctor.use, 'function');
    });

    it('should use a globally loaded plugin through the static use method:', function() {
      function Ctor() {
        Base.call(this);
      }
      Base.extend(Ctor);
      Ctor.use(function(app) {
        app.foo = 'bar';
      });
      var inst = new Ctor();
      assert.equal(inst.foo, 'bar');
    });

    it('should use a globally loaded plugin through the static use method with namespace:', function() {
      var Foo = Base.namespace('foo');
      Foo.use(function(app) {
        app.set('bar', 'baz');
      });
      var inst = new Foo();
      assert.equal(inst.get('bar'), 'baz');
      assert.equal(inst.foo.bar, 'baz');
    });

    it('should use different globally installed plugins when using different namespaces:', function() {
      var Foo = Base.namespace('foo');
      var Bar = Base.namespace('bar');

      Foo.use(function(app) {
        app.set('bar', 'baz');
      });
      Bar.use(function(app) {
        app.set('beep', 'boop');
      });

      var foo = new Foo();
      var bar = new Bar();

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

  describe('mixin', function() {
    it('should set the mixin method on the given object:', function() {
      function Ctor() {}
      Base.extend(Ctor);
      assert.equal(typeof Base.mixin, 'function');
      assert.equal(typeof Ctor.mixin, 'function');
    });

    it('should use a globally loaded mixin through the static mixin method:', function() {
      function Ctor() {
        Base.call(this);
      }
      Base.extend(Ctor);
      Base.mixin(function(proto) {
        proto.foo = 'bar';
      });

      var inst = new Ctor();
      Ctor.mixin(function(proto) {
        proto.bar = 'baz';
      });

      assert.equal(Base.prototype.foo, 'bar');
      assert.equal(Ctor.prototype.bar, 'baz');
      assert.equal(inst.foo, 'bar');
      assert.equal(inst.bar, 'baz');
    });
  });

  describe('mixins', function() {
    it('should set the mixins method on the given object:', function() {
      function Ctor() {}
      Base.extend(Ctor);
      assert.equal(typeof Ctor.mixins, 'function');
    });

    it('should use a globally loaded mixin through the static mixins method:', function() {

      function Ctor() {
        Base.call(this);
      }
      Base.extend(Ctor);
      Base.mixin(function fn(proto) {
        proto.bar = 'bar';
        return fn;
      });

      function Child() {
        Ctor.call(this);
      }
      Base.extend(Child);
      Base.mixins(Child);
      Ctor.mixins(Child);

      var inst = new Child();
      assert.equal(Child.prototype.bar, 'bar');
      assert.equal(inst.bar, 'bar');
    });
  });
});

describe('extend prototype methods', function() {
  beforeEach(function() {
    var Ctor = require('./');
    Base = Ctor.namespace();
  });

  it('should extend the prototype of the given Ctor:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert.equal(typeof Ctor.extend, 'function');

    var ctor = new Ctor();
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

  it('should expose `prototype.mixin` method', function() {
    assert.equal(typeof Base.prototype.mixin, 'function');
  });

  it('should add prototype methods to the given Ctor:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert.equal(typeof Ctor.prototype.set, 'function');
    assert.equal(typeof Ctor.prototype.get, 'function');
    assert.equal(typeof Ctor.prototype.del, 'function');
    assert.equal(typeof Ctor.prototype.visit, 'function');
    assert.equal(typeof Ctor.prototype.define, 'function');
    assert.equal(typeof Ctor.prototype.mixin, 'function');

    function foo() {}
    Ctor.extend(foo);
    assert.equal(typeof foo.prototype.set, 'function');
  });
});

describe('instance properties', function() {
  beforeEach(function() {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should expose the options property:', function() {
    assert(base.options);
    assert.equal(typeof base.options, 'object');
  });

  it('should expose the cache property:', function() {
    assert(base.cache);
    assert.equal(typeof base.cache, 'object');
  });
});

describe('prototype methods', function() {
  beforeEach(function() {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  describe('debug', function() {
    beforeEach(function() {
      base = new Base();
    });

    it('should expose a `debug` method', function() {
      assert.equal(typeof base.debug, 'function');
    });

    it('should debug return a `debug` function', function() {
      assert.equal(typeof base.debug('one'), 'function');
    });

    it('should debug without arguments be base namespace', function() {
      var app = base.debug()('foo bar baz');
      assert.equal(app._namespace, 'base');
      assert.equal(base._namespace, 'base');
      assert.equal(app._debugNamespace, 'base');
      assert.equal(base._debugNamespace, 'base');
    });

    it('should not double-append the same child namespace', function() {
      function Foo() {
        Base.call(this);
        this.is('foo');
      }
      Base.extend(Foo);

      function Bar() {
        Foo.call(this);
        this.is('bar');
      }
      Foo.extend(Bar);

      function Baz() {
        Bar.call(this);
        this.is('bar');
      }
      Bar.extend(Baz);

      var baz = new Baz();
      assert.equal(baz._debugNamespace, 'base:foo:bar');
    });

    it('should `debug` method return a new `debug` function', function() {
      var one = base.debug('one');
      var app1 = one('that is okey');
      assert.equal(typeof one, 'function');
      assert.equal(app1._debugNamespace, 'base:one');

      /**
       * Be careful with the order of calling the things
       * if you move this two lines above respectively
       * below `one` and below `app1`, then `app1._debugNamespace`
       * will fail, that's logical.
       *
       * More guaranteed is always to lookup `app._namespace`, it is
       * real app namespace, but not the `debug` namespace.
       * One is sure, debug namespace is bigger and always starts
       * with `app._namespace`.
       */
      var two = base.debug('one:two', 123, 'three', 'four:five');
      var app2 = two('that is awesome');
      assert.equal(typeof two, 'function');
      assert.equal(app2._debugNamespace, 'base:one:two:three:four:five');
    });

    it('should append child namespaces', function() {
      function Foo() {
        Base.call(this);
        this.is('foo');
      }
      Base.extend(Foo);

      function Bar() {
        Foo.call(this);
        this.is('bar');
      }
      Foo.extend(Bar);

      function Baz() {
        Bar.call(this);
        this.is('baz');
      }
      Bar.extend(Baz);

      var baz = new Baz();
      assert.equal(baz._debugNamespace, 'base:foo:bar:baz');
    });
  });

  describe('use', function() {
    beforeEach(function() {
      base = new Base();
    });

    it('should expose the use method:', function() {
      assert(base.use);
      assert.equal(typeof base.use, 'function');
    });

    it('should call the function passed to `use`:', function(cb) {
      base.use(function(app) {
        assert(app);
        cb();
      });
    });

    it('should expose the app instance:', function(cb) {
      base.foo = 'bar';
      base.use(function(app) {
        assert.equal(app.foo, 'bar');
        cb();
      });
    });

    it('should expose the app instance as "this":', function(cb) {
      base.foo = 'bar';
      base.use(function(app) {
        assert.equal(this.foo, 'bar');
        cb();
      });
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

    it('should not throw an error when a plugin is registered and checked with `assertPlugin`', function() {
      function fooPlugin(app) {
        if (app.isRegistered('foo')) return;
        base.foo = 'foo';
      }

      function barPlugin(app) {
        if (app.isRegistered('bar')) return;
        app.assertPlugin('foo');
        base.foo = base.foo + 'bar';
      }

      base.use(fooPlugin);
      base.use(barPlugin);

      assert.equal(base.foo, 'foobar');
    });

    it('should throw an error when a plugin is not registered and checked with `assertPlugin`', function(cb) {
      function barPlugin(app) {
        if (app.isRegistered('bar')) return;
        app.assertPlugin('foo');
        base.foo = base.foo + 'bar';
      }

      try {
        base.use(barPlugin);
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected plugin foo to be registered');
        cb();
      }
    });
  });

  describe('set', function() {
    it('should set a key-value pair on the instance:', function() {
      base.set('foo', 'bar');
      assert.equal(base.foo, 'bar');
    });

    it('should set nested property:', function() {
      base.set('a.b.c', 'd');
      assert.equal(base.a.b.c, 'd');
    });

    it('should set a nested property with the key as an array:', function() {
      base.set(['a', 'b', 'c'], 'd');
      assert.equal(base.a.b.c, 'd');
    });

    it('should set an object on the instance:', function() {
      base.set({a: 'b'});
      assert.equal(base.a, 'b');
    });
  });

  describe('get', function() {
    it('should get a property from the instance:', function() {
      base.set({a: 'b'});
      assert.equal(base.get('a'), 'b');
    });

    it('should get a nested property from the instance:', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get('a.b.c'), 'd');
    });

    it('should get a property using an array:', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get(['a', 'b', 'c']), 'd');
    });

    it('should get a property using a list of arguments', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.get('a', 'b', 'c'), 'd');
      assert.equal(base.get(['a', 'b'], 'c'), 'd');
      assert.equal(base.get('a', ['b', 'c']), 'd');
      assert.equal(base.get('a', 'b.c'), 'd');
    });
  });

  describe('has', function() {
    it('should work with namespaces:', function() {
      var Ctor = require('./');
      Base = Ctor.namespace('cache');
      var foo = new Base();

      foo.set({a: 'b'});
      assert.equal(foo.has('a'), true);
    });

    it('should check for a property from the instance:', function() {
      base.set({a: 'b'});
      assert.equal(base.has('a'), true);
    });

    it('should check for a nested property from the instance:', function() {
      base.set({a: {b: {c: 'd'}}});
      assert.equal(base.has('a.b.c'), true);
    });

    it('should check for a property using an array:', function() {
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

  describe('visit', function() {
    it('should visit an object with the given method:', function() {
      base.visit('set', {a: 'b', c: 'd'});
      assert.equal(base.get('a'), 'b');
      assert.equal(base.get('c'), 'd');
    });
    it('should visit an array with the given method:', function() {
      base.visit('set', [{a: 'b', c: 'd'}]);
      assert.equal(base.get('a'), 'b');
      assert.equal(base.get('c'), 'd');
    });
  });

  describe('del', function() {
    it('should remove a property:', function() {
      base.set({a: 'b'});
      assert.equal(base.a, 'b');
      base.del('a');
      assert.equal(typeof base.a, 'undefined');
    });

    it('should remove an array of properties:', function() {
      base.set({
        a: 'a'
      });
      base.set({
        b: 'b'
      });
      assert.equal(base.a, 'a');
      assert.equal(base.b, 'b');
      base.del(['a', 'b']);
      assert.equal(typeof base.a, 'undefined');
      assert.equal(typeof base.b, 'undefined');
    });
  });
});

describe('mixin', function() {
  beforeEach(function() {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should add a property to the base prototype:', function() {
    base.mixin('a', function() {});
    assert.equal(typeof base.a, 'function');
    assert.equal(typeof Base.prototype.a, 'function');
  });

  it('should add to the prototype of an inheriting app:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);
    var foo = new Foo();
    foo.mixin('a', function() {});
    assert.equal(typeof Foo.prototype.a, 'function');
    assert.equal(typeof foo.a, 'function');
  });

  it('should add to inheriting app prototype:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);

    var base = new Base();
    var foo = new Foo();

    base.mixin('abc', function() {});
    foo.mixin('xyz', function() {});

    assert.equal(typeof Base.prototype.abc, 'function');
    assert.equal(typeof Foo.prototype.abc, 'function');
    assert.equal(typeof base.abc, 'function');
    assert.equal(typeof foo.abc, 'function');

    assert(typeof Base.prototype.xyz !== 'function');
    assert.equal(typeof Foo.prototype.xyz, 'function');
    assert.equal(typeof foo.xyz, 'function');
    assert(typeof base.xyz !== 'function');
  });

  it('should chain calls to mixin:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);

    var base = new Base();
    var foo = new Foo();

    base.mixin('abc', function() {})
      .mixin('def', function() {});

    foo.mixin('xyz', function() {})
      .mixin('uvw', function() {});

    assert.equal(typeof Base.prototype.abc, 'function');
    assert.equal(typeof Base.prototype.def, 'function');
    assert.equal(typeof Foo.prototype.abc, 'function');
    assert.equal(typeof Foo.prototype.def, 'function');
    assert.equal(typeof base.abc, 'function');
    assert.equal(typeof base.def, 'function');
    assert.equal(typeof foo.abc, 'function');
    assert.equal(typeof foo.def, 'function');

    assert(typeof Base.prototype.xyz !== 'function');
    assert(typeof Base.prototype.uvw !== 'function');
    assert.equal(typeof Foo.prototype.xyz, 'function');
    assert.equal(typeof Foo.prototype.uvw, 'function');
    assert.equal(typeof foo.xyz, 'function');
    assert.equal(typeof foo.uvw, 'function');
    assert(typeof base.xyz !== 'function');
    assert(typeof base.uvw !== 'function');
  });

  it('should not add to Base.prototype from an inheriting app:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);

    var foo = new Foo();
    var base = new Base();

    foo.mixin('a', function() {});

    // yes
    assert.equal(typeof Foo.prototype.a, 'function');
    assert.equal(typeof foo.a, 'function');

    // no
    assert(typeof Base.prototype.a !== 'function');
    assert(typeof base.a !== 'function');
  });

  it('should NOT mixin from one inheriting prototype to another:', function() {
    function Foo() { Base.call(this); }
    Base.extend(Foo);

    function Bar() { Base.call(this); }
    Base.extend(Bar);

    var foo = new Foo();
    var bar = new Bar();

    foo.mixin('a', function() {});

    // yes
    assert.equal(typeof Foo.prototype.a, 'function');
    assert.equal(typeof foo.a, 'function');

    // no
    assert(typeof Bar.prototype.a !== 'function');
    assert(typeof bar.a !== 'function');
  });

  it('should mixin from Base.prototype to all others:', function() {
    function Foo() { Base.call(this); }
    Base.extend(Foo);

    function Bar() { Base.call(this); }
    Base.extend(Bar);

    var base = new Base();
    var foo = new Foo();
    var bar = new Bar();

    base.mixin('xyz', function() {});

    assert.equal(typeof Base.prototype.xyz, 'function');
    assert.equal(typeof Foo.prototype.xyz, 'function');
    assert.equal(typeof Bar.prototype.xyz, 'function');

    assert.equal(typeof base.xyz, 'function');
    assert.equal(typeof foo.xyz, 'function');
    assert.equal(typeof bar.xyz, 'function');
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

    it('should extend the given Ctor with static methods:', function() {
      var Foo = Base.namespace('cache');

      function Ctor() {
        Foo.call(this);
      }
      Foo.extend(Ctor);
      assert.equal(typeof Ctor.extend, 'function');

      function foo() {}
      Ctor.extend(foo);
      assert.equal(typeof foo.extend, 'function');
    });
  });

  describe('prototype methods', function() {
    beforeEach(function() {
      var Custom = Base.namespace('cache');
      base = new Custom();
    });

    describe('set', function() {
      it('should set a key-value pair on the instance:', function() {
        base.set('foo', 'bar');
        assert.equal(base.cache.foo, 'bar');
      });

      it('should set an object on the instance:', function() {
        base.set({
          a: 'b'
        });
        assert.equal(base.cache.a, 'b');
      });
    });

    describe('get', function() {
      it('should get a property from the instance:', function() {
        base.set({
          a: 'b'
        });
        assert.equal(base.get('a'), 'b');
      });

      it('should visit an object with the given method:', function() {
        base.visit('set', {
          a: 'b',
          c: 'd'
        });
        assert.equal(base.get('a'), 'b');
        assert.equal(base.get('c'), 'd');
      });
      it('should visit an array with the given method:', function() {
        base.visit('set', [{
          a: 'b',
          c: 'd'
        }]);
        assert.equal(base.get('a'), 'b');
        assert.equal(base.get('c'), 'd');
      });
    });

    describe('del', function() {
      it('should remove a property:', function() {
        base.set({
          a: 'b'
        });
        assert.equal(base.cache.a, 'b');
        base.del('a');
        assert.equal(typeof base.cache.a, 'undefined');
      });

      it('should remove an array of properties:', function() {
        base.set({
          a: 'a'
        });
        base.set({
          b: 'b'
        });
        assert.equal(base.cache.a, 'a');
        assert.equal(base.cache.b, 'b');
        base.del(['a', 'b']);
        assert.equal(typeof base.cache.a, 'undefined');
        assert.equal(typeof base.cache.b, 'undefined');
      });
    });
  });
});

describe('is', function() {
  beforeEach(function() {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should set a name prefixed with `is` on the instance:', function() {
    base.is('Foo');
    assert(base.isFoo);
    assert.equal(base.isFoo, true);
  });
});

describe('lazy', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should lazily invoke a plugin the first time its called', function() {
    var idx = 0;
    function plugin() {
      return function() {
        this.foo = 'bar';
        idx++;
      };
    }

    assert.equal(idx, 0);
    base.lazy('foo', plugin);
    assert.equal(idx, 0);
    assert.equal(base.foo, 'bar');
    assert.equal(idx, 1);
  });

  it('should lazily invoke a nested property the first time its parent is called', function() {
    var idx = 0;
    function plugin() {
      return function() {
        this.foo = {};
        this.foo.bar = 'baz';
        idx++;
      };
    }

    assert.equal(idx, 0);
    base.lazy('foo', plugin);
    assert.equal(idx, 0);
    assert.equal(base.foo.bar, 'baz');
    assert.equal(idx, 1);
  });
});

describe('events', function() {
  beforeEach(function() {
    base = new Base();
  });

  it('should emit and listen for events:', function(cb) {
    base.on('foo', function(val) {
      assert.equal(val, 'bar');
      cb();
    });
    base.emit('foo', 'bar');
  });

  it('should emit use', function(cb) {
    base.on('use', function(key, val) {
      cb();
    });
    base.use(function() {});
  });

  it('should emit plugin', function(cb) {
    base.on('plugin', function(key) {
      assert.equal(key, 'foo');
      cb();
    });
    base.use(function() {
      this.isRegistered('foo', true);
    });
  });

  it('should emit set', function(cb) {
    base.on('set', function(key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
      cb();
    });
    base.set('foo', 'bar');
  });

  it('should emit define', function(cb) {
    base.on('define', function(key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
      cb();
    });
    base.define('foo', 'bar');
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

  it('should emit has', function(cb) {
    base.on('has', function(key, has) {
      assert.equal(key, 'foo');
      assert.equal(has, true);
      cb();
    });
    base.set('foo', 'bar');
    base.has('foo');
  });

  it('should emit del', function(cb) {
    base.on('del', function(key, val) {
      assert.equal(key, 'foo');
      cb();
    });
    base.set('foo', 'bar');
    base.del('foo');
  });
});
