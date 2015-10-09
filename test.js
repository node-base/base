'use strict';

require('mocha');
require('should');
var assert = require('assert');

// if we export tests, this makes sure they work
var cwd = require('cwd');
var Base = require(cwd());
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

  it('should extend the instance when an object is passed:', function() {
    base = new Base({
      foo: 'bar'
    });
    assert(base.foo === 'bar');
  });

  it('should extend the instance when an array of objects is passed:', function() {
    var base = new Base([{
      foo: 'bar'
    }, {
      baz: 'qux'
    }]);
    assert(base.foo === 'bar');
    assert(base.baz === 'qux');
  });
});

describe('static methods', function() {
  beforeEach(function () {
    var Ctor = require('./');
    Base = Ctor.namespace();
  });

  it('should expose `.extend` method', function() {
    assert(typeof Base.extend === 'function');
  });

  it('should extend the given Ctor with static methods:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert(typeof Ctor.extend === 'function');

    function foo() {}
    Ctor.extend(foo);
    assert(typeof foo.extend === 'function');
  });

  describe('extend', function() {
    it('should set the extend method on the given object:', function() {
      function Ctor() {}
      Base.extend(Ctor);
      assert(typeof Ctor.extend === 'function');
    });
  });
});

describe('extend prototype methods', function() {
  beforeEach(function () {
    var Ctor = require('./');
    Base = Ctor.namespace();
  });

  it('should extend the prototype of the given Ctor:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert(typeof Ctor.extend === 'function');

    var ctor = new Ctor();
    assert(typeof ctor.set === 'function');
    assert(typeof ctor.get === 'function');
  });

  it('should expose `prototype.set` method', function() {
    assert(typeof Base.prototype.set === 'function');
  });

  it('should expose `prototype.get` method', function() {
    assert(typeof Base.prototype.get === 'function');
  });

  it('should expose `prototype.del` method', function() {
    assert(typeof Base.prototype.del === 'function');
  });

  it('should expose `prototype.visit` method', function() {
    assert(typeof Base.prototype.visit === 'function');
  });

  it('should expose `prototype.define` method', function() {
    assert(typeof Base.prototype.define === 'function');
  });

  it('should expose `prototype.mixin` method', function() {
    assert(typeof Base.prototype.mixin === 'function');
  });

  it('should add prototype methods to the given Ctor:', function() {
    function Ctor() {
      Base.call(this);
    }
    Base.extend(Ctor);
    assert(typeof Ctor.prototype.set === 'function');
    assert(typeof Ctor.prototype.get === 'function');
    assert(typeof Ctor.prototype.del === 'function');
    assert(typeof Ctor.prototype.visit === 'function');
    assert(typeof Ctor.prototype.define === 'function');
    assert(typeof Ctor.prototype.mixin === 'function');

    function foo() {}
    Ctor.extend(foo);
    assert(typeof foo.prototype.set === 'function');
  });
});

describe('prototype methods', function() {
  beforeEach(function () {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  describe('use', function() {
    beforeEach(function() {
      base = new Base();
    });

    it('should expose the use method:', function() {
      assert(base.use);
      assert(typeof base.use === 'function');
    });

    it('should call the function passed to `use`:', function(done) {
      base.use(function (app) {
        assert(app);
        done();
      });
    });

    it('should expose the app instance:', function(done) {
      base.foo = 'bar';
      base.use(function (app) {
        assert(app.foo === 'bar');
        done();
      });
    });

    it('should expose the app instance as "this":', function(done) {
      base.foo = 'bar';
      base.use(function (app) {
        assert(this.foo === 'bar');
        done();
      });
    });
  });
  describe('set', function() {
    it('should set a key-value pair on the instance:', function() {
      base.set('foo', 'bar');
      assert(base.foo === 'bar');
    });

    it('should set an object on the instance:', function() {
      base.set({a: 'b'});
      assert(base.a === 'b');
    });
  });

  describe('get', function() {
    it('should get a property from the instance:', function() {
      base.set({a: 'b'});
      assert(base.get('a') === 'b');
    });
  });

  describe('get', function() {
    it('should visit an object with the given method:', function() {
      base.visit('set', {a: 'b', c: 'd'});
      assert(base.get('a') === 'b');
      assert(base.get('c') === 'd');
    });
    it('should visit an array with the given method:', function() {
      base.visit('set', [{a: 'b', c: 'd'}]);
      assert(base.get('a') === 'b');
      assert(base.get('c') === 'd');
    });
  });

  describe('del', function() {
    it('should remove a property:', function() {
      base.set({a: 'b'});
      assert(base.a === 'b');
      base.del('a');
      assert(typeof base.a === 'undefined');
    });

    it('should remove an array of properties:', function() {
      base.set({
        a: 'a'
      });
      base.set({
        b: 'b'
      });
      assert(base.a === 'a');
      assert(base.b === 'b');
      base.del(['a', 'b']);
      assert(typeof base.a === 'undefined');
      assert(typeof base.b === 'undefined');
    });
  });
});

describe('mixin', function() {
  beforeEach(function () {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should add a property to the base prototype:', function() {
    base.mixin('a', function() {});
    assert(typeof base.a === 'function');
    assert(typeof Base.prototype.a === 'function');
  });

  it('should add to the prototype of an inheriting app:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);
    var foo = new Foo();
    foo.mixin('a', function() {});
    assert(typeof Foo.prototype.a === 'function');
    assert(typeof foo.a === 'function');
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

    assert(typeof Base.prototype.abc === 'function');
    assert(typeof Foo.prototype.abc === 'function');
    assert(typeof base.abc === 'function');
    assert(typeof foo.abc === 'function');

    assert(typeof Base.prototype.xyz !== 'function');
    assert(typeof Foo.prototype.xyz === 'function');
    assert(typeof foo.xyz === 'function');
    assert(typeof base.xyz !== 'function');
  });

  it('should not add to Base.prototype from an inheriting app:', function() {
    function Foo() {
      Base.call(this);
    }
    Base.extend(Foo);

    function Bar() {
      Base.call(this);
    }
    Base.extend(Bar);

    var foo = new Foo();
    var bar = new Bar();
    var base = new Base();

    foo.mixin('a', function() {});

    // yes
    assert(typeof Foo.prototype.a === 'function');
    assert(typeof foo.a === 'function');

    // no
    assert(typeof Base.prototype.a !== 'function');
    assert(typeof base.a !== 'function');
  });

  it('should NOT mixin from one inheriting prototype to another:', function() {
    function Foo() {Base.call(this);}
    Base.extend(Foo);

    function Bar() {Base.call(this);}
    Base.extend(Bar);

    var foo = new Foo();
    var bar = new Bar();

    foo.mixin('a', function() {});

    // yes
    assert(typeof Foo.prototype.a === 'function');
    assert(typeof foo.a === 'function');

    // no
    assert(typeof Bar.prototype.a !== 'function');
    assert(typeof bar.a !== 'function');
  });

  it('should mixin from Base.prototype to all others:', function() {
    function Foo() {Base.call(this);}
    Base.extend(Foo);

    function Bar() {Base.call(this);}
    Base.extend(Bar);

    var base = new Base();
    var foo = new Foo();
    var bar = new Bar();

    base.mixin('xyz', function() {});

    assert(typeof Base.prototype.xyz === 'function');
    assert(typeof Foo.prototype.xyz === 'function');
    assert(typeof Bar.prototype.xyz === 'function');

    assert(typeof base.xyz === 'function');
    assert(typeof foo.xyz === 'function');
    assert(typeof bar.xyz === 'function');
  });
});

describe('namespaces', function() {
  beforeEach(function () {
    Base = require('./');
  });

  describe('constructor', function() {
    it('should expose `namespace`', function() {
      assert(typeof Base.namespace === 'function');
    });

    it('should extend the given Ctor with static methods:', function() {
      var Foo = Base.namespace('cache');

      function Ctor() {
        Foo.call(this);
      }
      Foo.extend(Ctor);
      assert(typeof Ctor.extend === 'function');

      function foo() {}
      Ctor.extend(foo);
      assert(typeof foo.extend === 'function');
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
        assert(base.cache.foo === 'bar');
      });

      it('should set an object on the instance:', function() {
        base.set({
          a: 'b'
        });
        assert(base.cache.a === 'b');
      });
    });

    describe('get', function() {
      it('should get a property from the instance:', function() {
        base.set({
          a: 'b'
        });
        assert(base.get('a') === 'b');
      });

      it('should visit an object with the given method:', function() {
        base.visit('set', {
          a: 'b',
          c: 'd'
        });
        assert(base.get('a') === 'b');
        assert(base.get('c') === 'd');
      });
      it('should visit an array with the given method:', function() {
        base.visit('set', [{
          a: 'b',
          c: 'd'
        }]);
        assert(base.get('a') === 'b');
        assert(base.get('c') === 'd');
      });
    });

    describe('del', function() {
      it('should remove a property:', function() {
        base.set({
          a: 'b'
        });
        assert(base.cache.a === 'b');
        base.del('a');
        assert(typeof base.cache.a === 'undefined');
      });

      it('should remove an array of properties:', function() {
        base.set({
          a: 'a'
        });
        base.set({
          b: 'b'
        });
        assert(base.cache.a === 'a');
        assert(base.cache.b === 'b');
        base.del(['a', 'b']);
        assert(typeof base.cache.a === 'undefined');
        assert(typeof base.cache.b === 'undefined');
      });
    });
  });
});

describe('is', function() {
  beforeEach(function () {
    var Ctor = require('./');
    Base = Ctor.namespace();
    base = new Base();
  });

  it('should set a name prefixed with `is` on the instance:', function() {
    base.is('Foo');
    assert(base.isFoo);
    assert(base.isFoo === true);
  });
});

describe('events', function() {
  it('should emit and listen for events:', function(done) {
    base.on('foo', function(val) {
      assert(val === 'bar');
      done();
    })
    base.emit('foo', 'bar');
  });
});
