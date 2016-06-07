## Run gulp-like tasks

Add the [base-task](https://github.com/node-base/base-task) plugin:

```js
var task = require('base-task');
var Base = require('base');
var app = new Base();

// register the task plugin
app.use(task());

app.task('default', function(cb) {
  // do task stuff
  cb();
});

// run the `default` task
app.build(function(err) {
  if (err) throw err;
});
```

**Display run times**

To log out run times in the terminal, add the [base-runtimes](https://github.com/node-base/base-runtimes) plugin:

```js
var runtimes = require('base-runtimes');
var task = require('base-task');
var Base = require('base');
var app = new Base();

// register plugins
app.use(runtimes());
app.use(task());

app.task('default', function(cb) {
  // do task stuff
  cb();
});

// run the `default` task
app.build(function(err) {
  if (err) throw err;
});
```
