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
require('component-emitter', 'Emitter');
require('class-utils', 'cu');
require('isobject', 'isObject');
require('mixin-deep', 'merge');
require('pascalcase', 'pascal');
require = fn; // eslint-disable-line

/**
 * Expose `utils` modules
 */

module.exports = utils;
