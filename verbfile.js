'use strict';

var through = require('through2');

module.exports = function(verb) {
  verb.use(require('verb-readme-generator'));
  verb.task('default', ['readme'], function(cb) {
    return verb.src('README.md')
      .pipe(through.obj(function(file, enc, next) {
        var str = file.contents.toString();
        str = str.replace(/^(#+ \[)\.#/gm, '$1Base.');
        file.contents = new Buffer(str);
        next(null, file);
      }))
      .pipe(verb.dest('.'));
  });
};


