'use strict';

var through = require('through2');

module.exports = function(app) {
  app.use(require('verb-generate-readme'));
  app.task('default', ['readme'], function(cb) {
    return app.src('README.md')
      .pipe(through.obj(function(file, enc, next) {
        var str = file.contents.toString();
        str = str.replace(/^(#+ \[)#/gm, '$1Base.');
        file.contents = new Buffer(str);
        next(null, file);
      }))
      .pipe(app.dest('.'));
  });
};
