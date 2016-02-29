'use strict';

var Base = require('./index');

function Templates() {
  Base.call(this);
  this.is('templates');
}
Base.extend(Templates);

function Assemble() {
  Templates.call(this);
  this.is('assemble');
}
Templates.extend(Assemble);

function Generate() {
  Assemble.call(this);
  this.is('generate');
}
Assemble.extend(Generate);

function Verb() {
  Generate.call(this);
  this.is('verb');
}
Generate.extend(Verb);

var verb = new Verb();

console.log(verb._namespace);
//=> base:templates:assemble:generate:verb

var one = verb.debug('one');
one('debugging with %s Mike Reagent', 'Charlike');
//=> base:templates:assemble:generate:verb:one debugging with %s Mike Reagent

verb.debug.helper('loading foo helper');
//=> base:templates:assemble:generate:verb:helper loading foo helper

verb.debug('foo:bar', 123, 'baz:qux', 'zaz')('hello world');
//=> base:templates:assemble:generate:verb:foo:bar:baz:qux:zaz hello world

var templates = new Templates();
templates.debug('one:two', 'three:four')('okey, that is awesome');
//=> base:templates:one:two:three:four okey, that is awesome
